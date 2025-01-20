import * as THREE from 'three';

import earthTextureUrl from '../earth_texture.jpg';
import { createFrame } from './components.js';

const RADIUS_EARTH = 6371.0;

export function makeEarth(): { earth: THREE.Mesh; earth_frame: THREE.Group } {
  const earthGeometry = new THREE.SphereGeometry(RADIUS_EARTH, 64, 64);
  const earthMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    earthTextureUrl,
    (texture) => {
      earth.material.map = texture;
      earth.material.needsUpdate = true;
      console.log('Earth texture loaded');
    },
    undefined,
    (error) => {
      console.error('Error loading texture:', error);
    },
  );

  earth.rotation.x = Math.PI / 2;

  let earth_frame = createFrame(
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
