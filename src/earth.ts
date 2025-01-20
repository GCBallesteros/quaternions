import * as THREE from 'three';

import { createFrame } from './components.js';

const textureLevels = ['LR', 'MR', 'HR'].map(
  (resolution) =>
    import.meta.env.VITE_LOCAL_DEV === 'true'
      ? `/earth_texture_${resolution}.jpg` // Use root path for public assets in dev
      : `https://whatoneaerth.s3.eu-west-1.amazonaws.com/earth_texture_${resolution}.jpg`, // S3 URL for production
);

const RADIUS_EARTH = 6371.0;

export function makeEarth(): { earth: THREE.Mesh; earth_frame: THREE.Group } {
  const earthGeometry = new THREE.SphereGeometry(RADIUS_EARTH, 64, 64);
  const earthMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);

  const textureLoader = new THREE.TextureLoader();

  let currentLevel = 0;

  const loadNextTexture = () => {
    if (currentLevel >= textureLevels.length) return;

    const textureUrl = textureLevels[currentLevel];
    textureLoader.load(
      textureUrl,
      (texture) => {
        earth.material.map = texture;
        earth.material.needsUpdate = true;
        console.log(`Texture level ${currentLevel + 1} loaded`);
        currentLevel++;

        // Load the next level after a delay to avoid blocking
        setTimeout(loadNextTexture, 2000); // Adjust delay as needed
      },
      undefined,
      (error) => {
        console.error(`Error loading texture at level ${currentLevel}:`, error);
      },
    );
  };

  loadNextTexture();

  earth.rotation.x = Math.PI / 2;

  // Create the earth frame
  const earth_frame = createFrame(
    {
      x: 0,
      y: 0,
      z: 0,
    },
    8000,
  );

  return {
    earth: earth,
    earth_frame: earth_frame,
  };
}
