import * as THREE from 'three';
import { Array3, Vector4 } from '../types.js';

export interface CameraConfig {
  orientation: Vector4;
  fov: number;
}
import { Point } from './point.js';

export class OrientedPoint extends Point {
  public camera_orientation?: Vector4;
  constructor(geometry: THREE.Group, cameraConfig?: CameraConfig) {
    super(geometry);

    if (cameraConfig !== undefined) {
      this.camera_orientation = cameraConfig.orientation;
      this.addCamera(cameraConfig);
    }
  }

  /**
   * Returns the local coordinate frame vectors (x, y, z) of the point.
   * Each vector is returned as a tuple of numbers.
   */
  get frame(): { x: Array3; y: Array3; z: Array3 } {
    const quaternion = this.geometry.quaternion;

    const basisVectors = {
      x: new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).toArray(),
      y: new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion).toArray(),
      z: new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).toArray(),
    };
    return basisVectors;
  }

  addCamera(config: CameraConfig): void {
    const hasCamera = this.geometry.children.some(
      (child) => child instanceof THREE.Camera && child.name === '_camera',
    );

    if (hasCamera) {
      throw new Error('A camera named "_camera" already exists in this group!');
    }
    this.camera_orientation = config.orientation;

    let camera_orientation_in_body_frame = new THREE.Quaternion(
      config.orientation[0],
      config.orientation[1],
      config.orientation[2],
      config.orientation[3],
    );

    const camera = new THREE.PerspectiveCamera(config.fov, 1, 400, 500000);
    camera.name = '_camera';
    let camera_to_z_quaternion = new THREE.Quaternion();
    camera_to_z_quaternion.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      Math.PI,
    );
    camera.setRotationFromQuaternion(
      camera_orientation_in_body_frame.multiply(camera_to_z_quaternion),
    );
    // Layer 1 belongs to things that should be visible from the global view
    // but not from the satellite, e.g. the trail
    camera.layers.disable(1);
    this.geometry.add(camera);
  }

  get hasCamera(): boolean {
    return this.geometry.children.some(
      (child) => child instanceof THREE.Camera && child.name === '_camera',
    );
  }

  get camera(): THREE.Camera | null {
    const camera = this.geometry.children.find(
      (child) => child instanceof THREE.Camera && child.name === '_camera',
    );

    if (!camera) {
      if (this.hasCamera) {
        console.warn('No camera named "_camera" available in this group!');
      }
      return null;
    }
    return camera as THREE.Camera;
  }

  get cameraEcefAxis(): Record<string, Array3> | null {
    let camera = this.camera;

    if (!camera) {
      console.warn('No camera named "_camera" available in this group!');
      return null;
    }

    // Get the world quaternion which includes both body and camera rotations
    const worldQuaternion = new THREE.Quaternion();
    camera.getWorldQuaternion(worldQuaternion);

    // Define the camera's canonical axes in its local frame and transform to ECEF
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
      worldQuaternion,
    );
    const rows = new THREE.Vector3(-1, 0, 0).applyQuaternion(worldQuaternion);
    const columns = new THREE.Vector3(0, 1, 0).applyQuaternion(worldQuaternion);

    return {
      direction: [direction.x, direction.y, direction.z],
      rows: [rows.x, rows.y, rows.z],
      columns: [columns.x, columns.y, columns.z],
    };
  }

  get cameraBodyAxis(): Record<string, Array3> | null {
    let camera_quat_body = this.camera?.quaternion;

    if (!camera_quat_body) {
      return null;
    }

    // Define the camera's canonical axes in its local frame
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera_quat_body,
    );
    const rows = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera_quat_body);
    const columns = new THREE.Vector3(0, 1, 0).applyQuaternion(
      camera_quat_body,
    );

    return {
      direction: [direction.x, direction.y, direction.z],
      rows: [rows.x, rows.y, rows.z],
      columns: [columns.x, columns.y, columns.z],
    };
  }
}
