import * as THREE from 'three';

import { State, Vector4 } from '../types.js';
import {
  ObservatoryOrientationMode,
  OrientationMode,
} from '../types/orientation.js';

import { calculateOrientation } from './orientationUtils.js';
import { OrientedPoint } from './orientedPoint.js';

export class Observatory extends OrientedPoint {
  protected _observatoryOrientationMode: OrientationMode;

  constructor(
    orientation: Vector4,
    fov: number,
    observatoryOrientationMode: ObservatoryOrientationMode,
    color: string,
  ) {
    super(orientation, { fov: fov, orientation: [0, 0, 0, 1] }, color);

    if (observatoryOrientationMode.type === 'dynamic') {
      this._observatoryOrientationMode = {
        type: 'dynamic',
        primaryBodyVector: 'z',
        secondaryBodyVector: [0, -1, 0],
        primaryTargetVector: observatoryOrientationMode.primaryTargetVector,
        secondaryTargetVector: observatoryOrientationMode.secondaryTargetVector,
      };
    } else {
      this._observatoryOrientationMode = {
        type: 'fixed',
        ecef_quaternion: observatoryOrientationMode.ecef_quaternion,
      };
    }
  }

  /**
   * Updates the camera orientation based on the camera orientation mode
   * @param state Application state
   */
  update(state: State): void {
    if (!this._observatoryOrientationMode || !this.camera) {
      return;
    }

    try {
      const new_orientation = calculateOrientation(
        state,
        this._observatoryOrientationMode,
        this.geometry,
        null,
      );

      // Get the camera
      const camera = this.camera as THREE.Camera;

      // Create quaternion from the calculated orientation
      const q = new THREE.Quaternion(...new_orientation); // xyzw

      // Apply camera-specific rotation (to align with camera's coordinate system)
      const camera_to_z_quaternion = new THREE.Quaternion();
      camera_to_z_quaternion.setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        Math.PI,
      );

      // We want to have the camera rotation refered to the ECEF reference system
      // instead of the observatory's one.
      const observatoryWorldQuaternion = new THREE.Quaternion();
      this.geometry.getWorldQuaternion(observatoryWorldQuaternion);

      // Set the camera's rotation
      camera.setRotationFromQuaternion(
        observatoryWorldQuaternion.invert().multiply(q.multiply(camera_to_z_quaternion)),
      );
    } catch (error) {
      console.error('Error updating camera orientation:', error);
    }
  }
}
