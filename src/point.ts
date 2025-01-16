import * as THREE from 'three';
//import { Vector3 } from './types.js';

type Vector3 = [number, number, number];

export class Point {
  public geometry: THREE.Group;

  constructor(geometry: THREE.Group) {
    this.geometry = geometry;
  }

  get position(): Vector3 {
    const pos = this.geometry.position.clone();
    return [pos.x, pos.y, pos.z];
  }

  set position(pos: Vector3) {
    this.geometry.position.set(pos[0], pos[1], pos[2]);
  }
}

export class OrientedPoint extends Point {
  constructor(geometry: THREE.Group, camera?: THREE.PerspectiveCamera) {
    super(geometry);

    if (camera !== undefined) {
      camera.name = '_camera';
      this.geometry.add(camera);
    }
  }

  /**
   * Returns the local coordinate frame vectors (x, y, z) of the point.
   * Each vector is returned as a tuple of numbers.
   */
  get frame(): { x: Vector3; y: Vector3; z: Vector3 } {
    const quaternion = this.geometry.quaternion;

    const basisVectors = {
      x: new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).toArray(),
      y: new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion).toArray(),
      z: new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).toArray(),
    };
    return basisVectors;
  }

  addCamera(fov: number): void {
    const hasCamera = this.geometry.children.some(
      (child) => child instanceof THREE.Camera && child.name === '_camera',
    );

    if (hasCamera) {
      throw new Error('A camera named "_camera" already exists in this group!');
    }

    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 1000);
    camera.name = '_camera';
    this.geometry.add(camera);
  }

  get camera(): THREE.Camera | null {
    const camera = this.geometry.children.find(
      (child) => child instanceof THREE.Camera && child.name === '_camera',
    );

    if (!camera) {
      console.warn('No camera named "_camera" available in this group!');
      return null;
    }
    return camera as THREE.Camera;
  }
}
