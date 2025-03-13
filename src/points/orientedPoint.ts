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
  protected _pointOrientationMode?: OrientationMode;
  protected _cameraOrientationMode?: OrientationMode;

  constructor(
    geometry: THREE.Group,
    cameraConfig?: CameraConfig,
    pointOrientationMode?: OrientationMode,
    cameraOrientationMode?: OrientationMode,
  ) {
    super(geometry);

    if (cameraConfig !== undefined) {
      this.camera_orientation = cameraConfig.orientation;
      this.addCamera(cameraConfig);
    }

    this._pointOrientationMode = pointOrientationMode;
    this._cameraOrientationMode = cameraOrientationMode;
  }

  get pointOrientationMode(): OrientationMode | undefined {
    return this._pointOrientationMode;
  }

  set pointOrientationMode(mode: OrientationMode | undefined) {
    this._pointOrientationMode = mode;
  }

  get cameraOrientationMode(): OrientationMode | undefined {
    return this._cameraOrientationMode;
  }

  set cameraOrientationMode(mode: OrientationMode | undefined) {
    this._cameraOrientationMode = mode;
  }

  // For backward compatibility
  get orientationMode(): OrientationMode | undefined {
    return this._pointOrientationMode;
  }

  set orientationMode(mode: OrientationMode | undefined) {
    this._pointOrientationMode = mode;
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
        const pos = position_.clone().normalize().negate().toArray();
        return pos;
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

  /**
   * Calculates the orientation quaternion based on the specified orientation mode
   * @param state Application state
   * @param orientationMode The orientation mode to use for calculation
   * @param velocity_ Optional velocity vector (needed for Velocity target)
   * @returns Quaternion as Vector4 [x, y, z, w]
   */
  protected calculateOrientation(
    state: State,
    orientationMode: OrientationMode,
    velocity_: THREE.Vector3 | null = null,
  ): Vector4 {
    // Get world position instead of local position
    const worldPosition = new THREE.Vector3();
    this.geometry.getWorldPosition(worldPosition);
    const position_ = worldPosition;
    let new_orientation: Vector4;

    switch (orientationMode.type) {
      case 'dynamic': {
        const primaryTargetVector = this.isNamedTarget(
          orientationMode.primaryTargetVector,
        )
          ? this.getTargetVector(
              orientationMode.primaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : normalizeCoordinates(orientationMode.primaryTargetVector);

        const secondaryTargetVector = this.isNamedTarget(
          orientationMode.secondaryTargetVector,
        )
          ? this.getTargetVector(
              orientationMode.secondaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : normalizeCoordinates(orientationMode.secondaryTargetVector);

        const new_orientation_result = _findBestQuaternion(
          state,
          orientationMode.primaryBodyVector,
          orientationMode.secondaryBodyVector,
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
        new_orientation = orientationMode.ecef_quaternion;
        break;
      }
    }

    // Apply additional rotation if specified in dynamic mode
    if (
      orientationMode.type === 'dynamic' &&
      orientationMode.offset
    ) {
      const q = new THREE.Quaternion(...new_orientation);
      const offsetQ = new THREE.Quaternion(...orientationMode.offset);
      q.multiply(offsetQ);
      new_orientation = [q.x, q.y, q.z, q.w];
    }

    return new_orientation;
  }

  /**
   * Updates the camera orientation based on the camera orientation mode
   * For OrientedPoint, this updates the camera if one exists, but not the point itself
   * @param state Application state
   * @param velocity_ Optional velocity vector (needed for Velocity target)
   */
  updateOrientation(
    state: State,
    velocity_: THREE.Vector3 | null = null,
  ): void {
    if (!this._cameraOrientationMode || !this.camera) {
      return;
    }

    try {
      const new_orientation = this.calculateOrientation(state, this._cameraOrientationMode, velocity_);

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

      // Set the camera's rotation
      camera.setRotationFromQuaternion(q.multiply(camera_to_z_quaternion));
    } catch (error) {
      console.error('Error updating camera orientation:', error);
    }
  }

  /**
   * Updates the point's own orientation based on the point orientation mode
   * This is used by subclasses like Satellite that need to orient the entire object
   * @param state Application state
   * @param velocity_ Optional velocity vector (needed for Velocity target)
   */
  updatePointOrientation(
    state: State,
    velocity_: THREE.Vector3 | null = null,
  ): void {
    if (!this._pointOrientationMode) {
      return;
    }

    try {
      const new_orientation = this.calculateOrientation(state, this._pointOrientationMode, velocity_);
      const q = new THREE.Quaternion(...new_orientation); // xyzw
      this.geometry.setRotationFromQuaternion(q);
    } catch (error) {
      console.error('Error updating point orientation:', error);
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

    const camera = new THREE.PerspectiveCamera(config.fov, 1, 400, 500000);
    camera.name = '_camera';

    // Initial camera orientation
    const camera_orientation_in_body_frame = new THREE.Quaternion(
      config.orientation[0],
      config.orientation[1],
      config.orientation[2],
      config.orientation[3],
    );

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
