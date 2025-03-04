import * as satellite from 'satellite.js';
import * as THREE from 'three';

import { _fetchTLE, _findBestQuaternion } from '../core.js';
import { log } from '../logger.js';
import { Trail } from '../trail.js';
import { Array3, State, Vector4 } from '../types.js';
import { normalizeCoordinates } from '../utils.js';
import { Vector3 } from '../vectors.js';

import { CameraConfig, OrientedPoint } from './orientedPoint.js';

export type OrientationMode =
  | { type: 'fixed'; ecef_quaternion: Vector4 }
  | {
      type: 'dynamic';
      primaryBodyVector: Array3 | string;
      secondaryBodyVector: Array3 | string;
      primaryTargetVector: Array3 | NamedTargets | Vector3;
      secondaryTargetVector: Array3 | NamedTargets | Vector3;
      offset?: [number, number, number, number];
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

export class Satellite extends OrientedPoint {
  private tle: string;
  private _orientationMode: OrientationMode;
  public trail: Trail | null = null;
  public hasTrail: boolean = false;

  public enableTrail(): void {
    if (!this.hasTrail && this.camera) {
      this.trail = new Trail(
        this.geometry,
        this.geometry.position,
        this.geometry.parent as THREE.Scene,
      );
      this.hasTrail = true;
    }
  }

  public disableTrail(): void {
    if (this.trail) {
      this.trail.dispose();
      this.trail = null;
      this.hasTrail = false;
    }
  }

  get orientationMode(): OrientationMode {
    return this._orientationMode;
  }

  private isNamedTarget(value: any): value is NamedTargets {
    return typeof value === 'object' && value !== null && 'type' in value;
  }

  private getTargetVector(
    namedTarget: NamedTargets,
    position_: THREE.Vector3,
    velocity_: THREE.Vector3,
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

  constructor(
    scene: THREE.Scene,
    geometry: THREE.Group,
    tle: string,
    orientationMode: OrientationMode = {
      type: 'dynamic',
      primaryBodyVector: 'z',
      secondaryBodyVector: 'y',
      primaryTargetVector: NamedTargets.Nadir,
      secondaryTargetVector: NamedTargets.Velocity,
    },
    cameraConfig?: CameraConfig,
  ) {
    super(geometry, cameraConfig);
    this.tle = tle;
    this._orientationMode = orientationMode;

    // Initialize trail state if we have a camera
    if (cameraConfig) {
      this.hasTrail = true;
      this.trail = new Trail(geometry, geometry.position, scene);
    }
  }

  dispose(scene: THREE.Scene): void {
    if (this.trail) {
      this.trail.dispose();
    }
    super.dispose(scene);
  }

  static async fromNoradId(
    scene: THREE.Scene,
    geometry: THREE.Group,
    noradId: string,

    orientationMode: OrientationMode = {
      type: 'dynamic',
      primaryBodyVector: 'z',
      secondaryBodyVector: 'y',
      primaryTargetVector: NamedTargets.Nadir,
      secondaryTargetVector: NamedTargets.Velocity,
    },
    cameraConfig?: CameraConfig,
  ): Promise<Satellite> {
    const result = await _fetchTLE(noradId);
    let tle: string;
    if (result.ok) {
      log(`Fetched and cached TLE for COSPAR ID: ${noradId}`);
      tle = result.val;
    } else {
      throw new Error(result.val);
    }
    return new Satellite(scene, geometry, tle, orientationMode, cameraConfig);
  }

  set offset(offset: [number, number, number, number]) {
    if (this.orientationMode.type === 'dynamic') {
      this.orientationMode.offset = offset;
    } else {
      log('Trying to set orientation offset on non-dynamic mode.');
    }
  }

  update(timestamp: Date, state: State): void {
    const tleLines = this.tle.split('\n');
    const satrec = satellite.twoline2satrec(tleLines[1], tleLines[2]);

    if (!satrec) {
      throw new Error('Failed to parse TLE data');
    }

    const positionAndVelocity = satellite.propagate(satrec, timestamp);
    const position = positionAndVelocity.position;
    const velocity = positionAndVelocity.velocity;

    if (typeof position === 'boolean') {
      throw new Error('Failed to calculate satellite position');
    }
    if (typeof velocity === 'boolean') {
      throw new Error('Failed to calculate satellite position');
    }

    // Convert ECI to ECEF coordinates
    const gmst = satellite.gstime(timestamp);
    const position__ = satellite.eciToEcf(position, gmst);
    const position_ = new THREE.Vector3(
      position__.x,
      position__.y,
      position__.z,
    );
    const velocity__ = satellite.eciToEcf(velocity, gmst);
    const velocity_ = new THREE.Vector3(
      velocity__.x,
      velocity__.y,
      velocity__.z,
    );

    let new_orientation: Vector4;
    switch (this.orientationMode.type) {
      case 'dynamic':
        const primaryTargetVector = this.isNamedTarget(
          this.orientationMode.primaryTargetVector,
        )
          ? this.getTargetVector(
              this.orientationMode.primaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : normalizeCoordinates(this.orientationMode.primaryTargetVector);

        const secondaryTargetVector = this.isNamedTarget(
          this.orientationMode.secondaryTargetVector,
        )
          ? this.getTargetVector(
              this.orientationMode.secondaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : normalizeCoordinates(this.orientationMode.secondaryTargetVector);

        const new_orientation_result = _findBestQuaternion(
          state,
          this.orientationMode.primaryBodyVector,
          this.orientationMode.secondaryBodyVector,
          primaryTargetVector,
          secondaryTargetVector,
        );
        if (new_orientation_result.ok) {
          new_orientation = new_orientation_result.val;
        } else {
          throw Error('Something went wrong during quaternion calculation');
        }
        break;
      case 'fixed':
        new_orientation = this.orientationMode.ecef_quaternion;
    }

    this.position = [position_.x, position_.y, position_.z];
    let q = new THREE.Quaternion(...new_orientation); // xyzw

    // Apply additional rotation if specified in dynamic mode
    if (
      this.orientationMode.type === 'dynamic' &&
      this.orientationMode.offset
    ) {
      const offsetQ = new THREE.Quaternion(...this.orientationMode.offset);
      q = q.multiply(offsetQ);
    }

    this.geometry.setRotationFromQuaternion(q);

    // Update trail if it exists
    if (this.trail) {
      this.trail.update(this.geometry.position, this.cameraEcefAxis);
    }
  }
}
