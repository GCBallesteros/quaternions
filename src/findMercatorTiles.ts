import * as THREE from 'three';

// WebMercator Details
const mercatorTileTexture =
  import.meta.env.VITE_LOCAL_DEV === 'true'
    ? '/mercator_texture_zoom_4.png'
    : 'https://whatoneaerth.s3.eu-west-1.amazonaws.com/mercator_texture.png';
const zoom = 4;
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
