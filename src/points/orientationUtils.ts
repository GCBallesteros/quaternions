import * as THREE from 'three';

import { _findBestQuaternion } from '../core.js';
import { Array3, State, Array4 } from '../types.js';
import { NamedTargets, OrientationMode } from '../types/orientation.js';
import { normalizeCoordinates } from '../utils.js';
import { Err, Ok, Result } from 'ts-results';

export function isNamedTarget(value: any): value is NamedTargets {
  return typeof value === 'object' && value !== null && 'type' in value;
}

export function getTargetVector(
  namedTarget: NamedTargets,
  position: THREE.Vector3,
  velocity: THREE.Vector3 | null,
  state: State,
): Result<Array3, string> {
  let result: Array3;

  switch (namedTarget.type) {
    case 'Moon':
      result = state.bodies.moon.position
        .clone()
        .sub(position)
        .normalize()
        .toArray();
      break;
    case 'Sun':
      // Sun light position is already the direction vector
      result = state.lights.sun.position.toArray();
      break;
    case 'Velocity':
      if (!velocity) {
        return Err(
          'Velocity target is only valid for objects with velocity data',
        );
      }
      result = velocity.clone().normalize().toArray();
      break;
    case 'Nadir':
      result = position.clone().normalize().negate().toArray();
      break;
    case 'TargetPointing': {
      const targetPos =
        typeof namedTarget.target === 'string'
          ? state.points[namedTarget.target].position
          : normalizeCoordinates(namedTarget.target);

      result = new THREE.Vector3(...targetPos)
        .clone()
        .sub(position)
        .normalize()
        .toArray();
      break;
    }
    default:
      const _exhaustiveCheck: never = namedTarget;
      return Err(`Unhandled target type: ${(namedTarget as any).type}`);
  }
  return Ok(result);
}

/**
 * Calculates the orientation quaternion based on the specified orientation mode
 * @param state Application state
 * @param orientationMode The orientation mode to use for calculation
 * @param velocity_ Optional velocity vector (needed for Velocity target)
 * @returns Quaternion as Array4 [x, y, z, w]
 */
export function calculateOrientation(
  state: State,
  orientationMode: OrientationMode,
  geometry: THREE.Group,
  velocity_: THREE.Vector3 | null = null,
): Array4 {
  // Get world position instead of local position
  const worldPosition = new THREE.Vector3();
  geometry.getWorldPosition(worldPosition);
  const position_ = worldPosition;
  let new_orientation: Array4;

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
        : Ok(normalizeCoordinates(orientationMode.primaryTargetVector));

      const secondaryTargetVector = isNamedTarget(
        orientationMode.secondaryTargetVector,
      )
        ? getTargetVector(
            orientationMode.secondaryTargetVector,
            position_,
            velocity_,
            state,
          )
        : Ok(normalizeCoordinates(orientationMode.secondaryTargetVector));

      let new_orientation_result: Result<Array4, string>;
      if (primaryTargetVector.ok && secondaryTargetVector.ok) {
        new_orientation_result = _findBestQuaternion(
          state,
          orientationMode.primaryBodyVector,
          orientationMode.secondaryBodyVector,
          primaryTargetVector.val,
          secondaryTargetVector.val,
        );
      } else {
        new_orientation_result = Err('Bad inputs to _findBestQuaternion');
      }

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
