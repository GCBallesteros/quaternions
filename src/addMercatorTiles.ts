import * as THREE from 'three';
import { Err, Ok, Result } from 'ts-results';

import { RADIUS_EARTH, SEMI_MINOR_EARTH_AXIS } from './constants.js';
import { State } from './types.js';
import { disposeObject } from './utils.js';

const textureLoader = new THREE.TextureLoader();

function webMercatorToLatLon(
  x: number,
  y: number,
  z: number,
): { lat: number; lon: number } {
  const n = Math.pow(2, z);

  const sinh_arg = Math.PI * (1 - (2 * y) / n);
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(sinh_arg));

  const lon = (x / n) * 360 - 180;
  return { lat, lon };
}

function createWebMercatorPatch(
  name: string,
  lonLeft: number,
  lonRight: number,
  latTop: number,
  latBottom: number,
  texture: THREE.Texture,
): THREE.Mesh {
  const rows = 15,
    cols = 15;
  const patchGeometry = new THREE.BufferGeometry();
  const positions: number[] = [],
    uvs: number[] = [];

  const mercatorYTop =
    Math.log(Math.tan((latTop + 90) * (Math.PI / 360))) / Math.PI;
  const mercatorYBottom =
    Math.log(Math.tan((latBottom + 90) * (Math.PI / 360))) / Math.PI;

  for (let i = 0; i <= rows; i++) {
    for (let j = 0; j <= cols; j++) {
      // 1. Compute longitude (linear interpolation is fine)
      // Positions based on:
      const lon = lonLeft + (j / cols) * (lonRight - lonLeft);

      // 2. Interpolate in Mercator space and convert back to geodetic latitude (in degrees)
      // This eliminates the distortion introduced by the fact that the CRS of tile
      // is different than the intrinsic geometr of the Earth ellipsoid.
      const mercatorY =
        mercatorYTop + (i / rows) * (mercatorYBottom - mercatorYTop);
      const lat = (Math.atan(Math.sinh(Math.PI * mercatorY)) * 180) / Math.PI;

      // 3. Go to radians
      const theta = lon * (Math.PI / 180);
      const phi = lat * (Math.PI / 180);

      // 4. Compute the 3D ellipsoidal coordinates using Earth constants
      const a = RADIUS_EARTH; // Semi-major axis (equatorial radius)
      const b = SEMI_MINOR_EARTH_AXIS; // Semi-minor axis

      // Calculate position on ellipsoid
      const x = a * Math.cos(phi) * Math.cos(theta);
      const y = a * Math.cos(phi) * Math.sin(theta);
      const z = b * Math.sin(phi);

      positions.push(x, y, z);

      // 5. UV Mapping (Web Mercator based)
      const u = Math.max(
        0,
        Math.min(1, (lon - lonLeft) / (lonRight - lonLeft)),
      );
      const v = Math.max(
        0,
        Math.min(
          1,
          (mercatorY - mercatorYBottom) / (mercatorYTop - mercatorYBottom),
        ),
      );
      uvs.push(u, v);
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = i * (cols + 1) + (j + 1);
      const c = (i + 1) * (cols + 1) + j;
      const d = (i + 1) * (cols + 1) + (j + 1);
      indices.push(a, b, c, b, d, c);
    }
  }

  patchGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  patchGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  patchGeometry.setIndex(indices);

  const patchMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: false,
  });

  const patch = new THREE.Mesh(patchGeometry, patchMaterial);
  patch.name = name;

  // Set the patch to layer 2 - only visible from non-main cameras
  patch.layers.set(2);

  return patch;
}

/**
 * Removes a mercator tile from the scene and properly disposes of its resources
 * @param tileKey The key of the tile to remove (format: "x,y,z")
 * @param scene The THREE.Scene containing the tile
 * @param state The application state
 * @returns Result indicating success or failure
 */
export function removeWebMercatorTile(
  tileKey: string,
  scene: THREE.Scene,
  state: State,
): Result<null, string> {
  if (!state._webmercatorTiles.has(tileKey)) {
    return Err(`Tile ${tileKey} not found in state`);
  }

  const patchName = `mercator_tile_${tileKey}`;
  const patch = scene.getObjectByName(patchName);

  if (!patch) {
    // Remove from state even if not found in scene
    state._webmercatorTiles.delete(tileKey);
    return Err(`Tile mesh ${patchName} not found in scene`);
  }

  // Remove from scene and dispose resources
  scene.remove(patch);
  disposeObject(patch);

  // Remove from state
  state._webmercatorTiles.delete(tileKey);

  return Ok(null);
}

export function addWebMercatorTile(
  x: number,
  y: number,
  z: number,
  scene: THREE.Scene,
  state: State,
): Result<null, string> {
  const maxTileIndex = Math.pow(2, z) - 1;
  if (x > maxTileIndex || y > maxTileIndex) {
    return Err('x/y coordinate to large for zoom level');
  }

  const tileKey = `${x},${y},${z}`;
  if (state._webmercatorTiles.has(tileKey)) {
    return Ok(null);
  }

  // If we've reached capacity, remove the oldest tile
  if (state._webmercatorTilesQueue.isFull) {
    const oldestTileKey = state._webmercatorTilesQueue.shift();
    if (oldestTileKey.some) {
      removeWebMercatorTile(oldestTileKey.val, scene, state);
    }
  }

  const tileUrl = `https://www.google.com/maps/vt?lyrs=s@189&gl=cn&x=${x}&y=${y}&z=${z}`;
  const patchTexture = textureLoader.load(tileUrl);

  // Calculate the corners using your conversion function:
  const { lat: latTop, lon: lonLeft } = webMercatorToLatLon(x, y, z);
  const { lat: latBottom, lon: lonRight } = webMercatorToLatLon(
    x + 1,
    y + 1,
    z,
  );

  // Create the patch and add it to the scene:
  const newPatch = createWebMercatorPatch(
    `mercator_tile_${tileKey}`,
    lonLeft,
    lonRight,
    latTop,
    latBottom,
    patchTexture,
  );
  scene.add(newPatch);

  // Add to the set and queue
  state._webmercatorTiles.add(tileKey);
  state._webmercatorTilesQueue.push(tileKey);

  return Ok(null);
}
