import * as THREE from 'three';

const MOON_RADIUS = 1737.1; // Moon's radius in kilometers

export function makeMoon(): THREE.Mesh {
  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 32, 32);
  const moonMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.8,
    metalness: 0.1,
  });
  return new THREE.Mesh(moonGeometry, moonMaterial);
}
