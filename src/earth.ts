import * as THREE from "three";

import { createFrame } from "./components.js";
import earthTextureUrl from '../earth_texture.jpg';

const RADIUS_EARTH = 6371.0;

export function makeEarth() {
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load(
    earthTextureUrl,
    () => {
      console.log("Earth texture loaded");
    },
    undefined,
    (error) => {
      console.error("Error loading texture:", error);
    },
  );

  const earthGeometry = new THREE.SphereGeometry(RADIUS_EARTH, 32, 32);
  const earthMaterial = new THREE.MeshBasicMaterial({
    map: earthTexture,
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
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
