import { Array3, Vector4 } from '../types.js';
import { Vector3 } from '../vectors.js';

export type OrientationMode =
  | { type: 'fixed'; ecef_quaternion: Vector4 }
  | {
      type: 'dynamic';
      primaryBodyVector: Array3 | string;
      secondaryBodyVector: Array3 | string;
      primaryTargetVector: Array3 | NamedTargets | Vector3;
      secondaryTargetVector: Array3 | NamedTargets | Vector3;
      offset?: Vector4;
    };

export type ObservatoryOrientationMode =
  | { type: 'fixed'; ecef_quaternion: Vector4 }
  | {
      type: 'dynamic';
      primaryTargetVector: Array3 | NamedTargets | Vector3;
      secondaryTargetVector: Array3 | NamedTargets | Vector3;
    };

export type NamedTargets =
  | { type: 'Moon' }
  | { type: 'Sun' }
  | { type: 'Velocity' }
  | { type: 'Nadir' }
  | { type: 'TargetPointing'; target: Array3 | string | Vector3 };

export namespace NamedTargets {
  export const Moon: NamedTargets = { type: 'Moon' };
  export const Sun: NamedTargets = { type: 'Sun' };
  export const Velocity: NamedTargets = { type: 'Velocity' };
  export const Nadir: NamedTargets = { type: 'Nadir' };
  export const TargetPointing = (
    target: Array3 | string | Vector3,
  ): NamedTargets => ({
    type: 'TargetPointing',
    target,
  });
}
