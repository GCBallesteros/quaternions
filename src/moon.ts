import * as THREE from 'three';

const MOON_RADIUS = 1737.1;

export function makeMoon(): THREE.Mesh {
  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  const moonTexture = textureLoader.load(
    import.meta.env.VITE_LOCAL_DEV === 'true'
      ? `/moon.jpg`
      : `https://whatoneaerth.s3.eu-west-1.amazonaws.com/moon.jpg`,
  );

  const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    roughness: 0.8,
    metalness: 0.1,
  });

  const moon = new THREE.Mesh(moonGeometry, moonMaterial);

  return moon;
}
