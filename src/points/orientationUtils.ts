import * as THREE from 'three';

import { _findBestQuaternion } from '../core.js';
import { Array3, State, Vector4 } from '../types.js';
import { NamedTargets, OrientationMode } from '../types/orientation.js';
import { normalizeCoordinates } from '../utils.js';

export function isNamedTarget(value: any): value is NamedTargets {
  return typeof value === 'object' && value !== null && 'type' in value;
}

export function getTargetVector(
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
export function calculateOrientation(
  state: State,
  orientationMode: OrientationMode,
  geometry: THREE.Group,
  velocity_: THREE.Vector3 | null = null,
): Vector4 {
  // Get world position instead of local position
  const worldPosition = new THREE.Vector3();
  geometry.getWorldPosition(worldPosition);
  const position_ = worldPosition;
  let new_orientation: Vector4;

  switch (orientationMode.type) {
    case 'dynamic': {
      const primaryTargetVector = isNamedTarget(
        orientationMode.primaryTargetVector,
      )
        ? getTargetVector(
            orientationMode.primaryTargetVector,
            position_,
            velocity_,
            state,
          )
        : normalizeCoordinates(orientationMode.primaryTargetVector);

      const secondaryTargetVector = isNamedTarget(
        orientationMode.secondaryTargetVector,
      )
        ? getTargetVector(
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
  if (orientationMode.type === 'dynamic' && orientationMode.offset) {
    const q = new THREE.Quaternion(...new_orientation);
    const offsetQ = new THREE.Quaternion(...orientationMode.offset);
    q.multiply(offsetQ);
    new_orientation = [q.x, q.y, q.z, q.w];
  }

  return new_orientation;
}
