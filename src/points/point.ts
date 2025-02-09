import * as THREE from 'three';
import { Vector3 } from '../types.js';
import { disposeObject } from '../utils.js';

export class Point {
  public geometry: THREE.Group;

  constructor(geometry: THREE.Group) {
    this.geometry = geometry;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.geometry);
    disposeObject(this.geometry);
  }

  get position(): Vector3 {
    const pos = this.geometry.position.clone();
    return [pos.x, pos.y, pos.z];
  }

  set position(pos: Vector3) {
    this.geometry.position.set(pos[0], pos[1], pos[2]);
  }

  get color(): string {
    const sphere = this.geometry.children.find(
      (child) => child instanceof THREE.Mesh && child.name === 'point-sphere',
    ) as THREE.Mesh;

    if (sphere && sphere.material instanceof THREE.MeshBasicMaterial) {
      return '#' + sphere.material.color.getHexString();
    }
    return '#ffffff';
  }

  set color(color: string) {
    const sphere = this.geometry.children.find(
      (child) => child instanceof THREE.Mesh && child.name === 'point-sphere',
    ) as THREE.Mesh;

    if (sphere && sphere.material instanceof THREE.MeshBasicMaterial) {
      sphere.material.color.set(color);
    }
  }
}
