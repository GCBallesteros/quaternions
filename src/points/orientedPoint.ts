import * as THREE from 'three';

import { _findBestQuaternion } from '../core.js';
import { State } from '../types.js';
import { Array3, Vector4 } from '../types.js';
import { NamedTargets, OrientationMode } from '../types/orientation.js';
import { normalizeCoordinates } from '../utils.js';
import { Vector3 } from '../vectors.js';

export interface CameraConfig {
  orientation: Vector4;
  fov: number;
}
import { Point } from './point.js';

export class OrientedPoint extends Point {
  public camera_orientation?: Vector4;
  protected _orientationMode?: OrientationMode;

  constructor(
    geometry: THREE.Group,
    cameraConfig?: CameraConfig,
    orientationMode?: OrientationMode,
  ) {
    super(geometry);

    if (cameraConfig !== undefined) {
      this.camera_orientation = cameraConfig.orientation;
      this.addCamera(cameraConfig);
    }

    this._orientationMode = orientationMode;
  }

  get orientationMode(): OrientationMode | undefined {
    return this._orientationMode;
  }

  set orientationMode(mode: OrientationMode | undefined) {
    this._orientationMode = mode;
  }

  protected isNamedTarget(value: any): value is NamedTargets {
    return typeof value === 'object' && value !== null && 'type' in value;
  }

  protected getTargetVector(
    namedTarget: NamedTargets,
    position_: THREE.Vector3,
    velocity_: THREE.Vector3 | null,
    state: State,
  ): Array3 {
    switch (namedTarget.type) {
      case 'Moon':
        return state.bodies.moon.position
          .clone()
          .sub(position_)
          .normalize()
          .toArray();
      case 'Sun':
        // Sun light position is already the direction vector
        return state.lights.sun.position.toArray();
      case 'Velocity':
        if (!velocity_) {
          throw new Error(
            'Velocity target is only valid for objects with velocity data',
          );
        }
        return velocity_.clone().normalize().toArray();
      case 'Nadir':
        return position_.clone().normalize().negate().toArray();
      case 'TargetPointing':
        if (typeof namedTarget.target === 'string') {
          return new THREE.Vector3(...state.points[namedTarget.target].position)
            .clone()
            .sub(position_)
            .normalize()
            .toArray();
        } else {
          return new THREE.Vector3(...normalizeCoordinates(namedTarget.target))
            .clone()
            .sub(position_)
            .normalize()
            .toArray();
        }
    }
  }

  updateOrientation(
    state: State,
    velocity_: THREE.Vector3 | null = null,
  ): void {
    if (!this._orientationMode) {
      return;
    }

    // Get world position instead of local position
    const worldPosition = new THREE.Vector3();
    this.geometry.getWorldPosition(worldPosition);
    const position_ = worldPosition;
    let new_orientation: Vector4;

    switch (this._orientationMode.type) {
      case 'dynamic': {
        const primaryTargetVector = this.isNamedTarget(
          this._orientationMode.primaryTargetVector,
        )
          ? this.getTargetVector(
              this._orientationMode.primaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : normalizeCoordinates(this._orientationMode.primaryTargetVector);

        const secondaryTargetVector = this.isNamedTarget(
          this._orientationMode.secondaryTargetVector,
        )
          ? this.getTargetVector(
              this._orientationMode.secondaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : normalizeCoordinates(this._orientationMode.secondaryTargetVector);

        const new_orientation_result = _findBestQuaternion(
          state,
          this._orientationMode.primaryBodyVector,
          this._orientationMode.secondaryBodyVector,
          primaryTargetVector,
          secondaryTargetVector,
        );
        if (new_orientation_result.ok) {
          new_orientation = new_orientation_result.val;
        } else {
          throw Error('Something went wrong during quaternion calculation');
        }
        break;
      }
      case 'fixed': {
        new_orientation = this._orientationMode.ecef_quaternion;
        break;
      }
    }

    let q = new THREE.Quaternion(...new_orientation); // xyzw

    // Apply additional rotation if specified in dynamic mode
    if (
      this._orientationMode.type === 'dynamic' &&
      this._orientationMode.offset
    ) {
      const offsetQ = new THREE.Quaternion(...this._orientationMode.offset);
      q = q.multiply(offsetQ);
    }

    this.geometry.setRotationFromQuaternion(q);
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

    const camera_orientation_in_body_frame = new THREE.Quaternion(
      config.orientation[0],
      config.orientation[1],
      config.orientation[2],
      config.orientation[3],
    );

    const camera = new THREE.PerspectiveCamera(config.fov, 1, 400, 500000);
    camera.name = '_camera';
    const camera_to_z_quaternion = new THREE.Quaternion();
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
    // Layer 2 belongs to things that should only be visible from non-main cameras
    // like high-resolution Earth tiles
    camera.layers.enable(2);
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
    const camera = this.camera;

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
    const camera_quat_body = this.camera?.quaternion;

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
