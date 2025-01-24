import * as THREE from 'three';

import { createFrame } from './components.js';

const textureLevels = ['LR', 'MR', 'HR'].map((resolution) =>
  import.meta.env.VITE_LOCAL_DEV === 'true'
    ? `/earth_texture_${resolution}.jpg`
    : `https://whatoneaerth.s3.eu-west-1.amazonaws.com/earth_texture_${resolution}.jpg`,
);

const normalMapUrl = import.meta.env.VITE_LOCAL_DEV === 'true'
  ? '/earth_normals.jpg'
  : 'https://whatoneaerth.s3.eu-west-1.amazonaws.com/earth_normals.jpg';

const RADIUS_EARTH = 6371.0;

export function makeEarth(): { earth: THREE.Mesh; earth_frame: THREE.Group } {
  const earthGeometry = new THREE.SphereGeometry(RADIUS_EARTH, 64, 64);
  const earthMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.8,    // Higher roughness reduces glossiness
    metalness: 0.1     // Low metalness for a more matte look
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);

  const textureLoader = new THREE.TextureLoader();

  let currentLevel = 0;

  const loadNextTexture = () => {
    if (currentLevel >= textureLevels.length) {
      // After all textures are loaded, load the normal map
      textureLoader.load(
        normalMapUrl,
        (normalMap) => {
          earth.material.normalMap = normalMap;
          earth.material.normalScale.set(1, 1);
          earth.material.needsUpdate = true;
          console.log('Normal map loaded');
        },
        undefined,
        (error) => {
          console.error('Error loading normal map:', error);
        },
      );
      return;
    }

    const textureUrl = textureLevels[currentLevel];
    textureLoader.load(
      textureUrl,
      (texture) => {
        earth.material.map = texture;
        earth.material.needsUpdate = true;
        console.log(`Texture level ${currentLevel + 1} loaded`);
        if (currentLevel !== 0) {
          setTimeout(loadNextTexture, 2000);
        } else {
          setTimeout(loadNextTexture, 10);

        }
        currentLevel++;
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
