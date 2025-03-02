import * as THREE from 'three';

// What?
// ====
// Find what Web Mercator tiles are visible from the POV of a camera
//
// Why?
// ====
// A single high resolution texture of the Earth occupies 100 of MPx
// which is obviously inviable. Instead we will just fetch the tiles
// that are visible from a camera.
//
// How?
// ====
// In a nutshell we check every pixel seen by the camera to see if
// the Earth is visible and in that case find its lat/long and from
// there what WebMercator tile covers it at a given zoom level.
//
// Trick
// =====
// We precompute a texture of the Earth where the B and G channels
// correspond to the x/y coordinates of the WebMercator tile under it.
// Then we run an offscreen render of this sphere as seen from the
// camera of interest and bring it out as a buffer. The final
// step is to find all the unique values in said render. Easy!

// WebMercator Details
const zoom = 8;
const mercatorTileTexture =
  import.meta.env.VITE_LOCAL_DEV === 'true'
    ? `/mercator_texture_zoom_${zoom}.png`
    : 'https://whatoneaerth.s3.eu-west-1.amazonaws.com/mercator_texture.png';
const n = Math.pow(2, zoom);

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

const RADIUS_EARTH = 6371.0;

// Load Precomputed Tile Texture
const textureLoader = new THREE.TextureLoader();
const precomputedTileTexture = textureLoader.load(mercatorTileTexture, () => {
  precomputedTileTexture.minFilter = THREE.NearestFilter;
  precomputedTileTexture.magFilter = THREE.NearestFilter;
  precomputedTileTexture.wrapS = THREE.ClampToEdgeWrapping;
  precomputedTileTexture.wrapT = THREE.ClampToEdgeWrapping;
  addEarthSphere(precomputedTileTexture, scene);
});

function addEarthSphere(texture: THREE.Texture, scene: THREE.Scene) {
  const sphereGeometry = new THREE.SphereGeometry(RADIUS_EARTH, 64, 64);
  const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.rotation.x = Math.PI / 2; // Align for Mercator projection
  scene.add(sphereMesh);
}

const n_ = 512;
const m_ = 512;
const auxRT = new THREE.WebGLRenderTarget(n_, m_, {
  type: THREE.UnsignedByteType,
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  wrapS: THREE.ClampToEdgeWrapping,
  wrapT: THREE.ClampToEdgeWrapping,
  depthBuffer: false,
  stencilBuffer: false,
});

export function findMercatorTilesInPOV(camera: THREE.PerspectiveCamera) {
  // Step 1: Render the Mercator tile globe from current camera
  renderer.setRenderTarget(auxRT);
  renderer.render(scene, camera);

  // Step 2: Read out the scene
  renderer.setRenderTarget(auxRT);
  const pixelBuffer = new Uint8Array(n_ * m_ * 4);
  renderer.readRenderTargetPixels(auxRT, 0, 0, n_, m_, pixelBuffer);

  // Step 3: Extract all the unique mercator tiles that can be seen
  const visibleTiles: Set<number> = new Set();
  for (let y = 0; y < m_; y++) {
    for (let x = 0; x < n_; x++) {
      const index = (y * n_ + x) * 4; // RGBA has 4 channels per pixel

      const tileX = Math.round(pixelBuffer[index + 2]);
      const tileY = Math.round(pixelBuffer[index + 1]);

      // Skip invalid tiles
      if (tileX >= 0 && tileY >= 0) {
        // Translate to a linear index that correspoind to the WebMercator
        // grid because js Sets don't support tuples of numbers.
        const linearIndex = tileY * n + tileX; // Flattened 2D index
        visibleTiles.add(linearIndex);
      }
    }
  }

  // Step 4: Turn the linear indices into xy tile coords again
  const visibleTileList = Array.from(visibleTiles).map((index) => {
    const tileX = index % n;
    const tileY = Math.floor(index / n);
    return [tileX, tileY];
  });

  return visibleTileList;
}
