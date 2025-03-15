import * as satellite from 'satellite.js';
import * as THREE from 'three';

import { _fetchTLE } from '../core.js';
import { log } from '../logger.js';
import { Trail } from '../trail.js';
import { State, Vector4 } from '../types.js';
import { OrientationMode } from '../types/orientation.js';
import { calculateOrientation } from './orientationUtils.js';

import { CameraConfig, OrientedPoint } from './orientedPoint.js';

export class Satellite extends OrientedPoint {
  private tle: string;
  public trail: Trail | null = null;
  public hasTrail: boolean = false;
  private orientationMode: OrientationMode;

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

  constructor(
    scene: THREE.Scene,
    tle: string,
    orientationMode: OrientationMode = {
      type: 'dynamic',
      primaryBodyVector: 'z',
      secondaryBodyVector: 'y',
      primaryTargetVector: { type: 'Nadir' },
      secondaryTargetVector: { type: 'Velocity' },
    },
    cameraConfig?: CameraConfig,
  ) {
    super([0, 0, 0, 1], cameraConfig);
    this.tle = tle;
    this.orientationMode = orientationMode;

    // Initialize trail state if we have a camera
    if (cameraConfig) {
      this.hasTrail = true;
      this.trail = new Trail(this.geometry, this.geometry.position, scene);
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
    noradId: string,
    orientationMode: OrientationMode = {
      type: 'dynamic',
      primaryBodyVector: 'z',
      secondaryBodyVector: 'y',
      primaryTargetVector: { type: 'Nadir' },
      secondaryTargetVector: { type: 'Velocity' },
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
    return new Satellite(scene, tle, orientationMode, cameraConfig);
  }

  set offset(offset: Vector4) {
    if (this.orientationMode?.type === 'dynamic') {
      this.orientationMode.offset = offset;
    } else {
      log('Trying to set orientation offset on non-dynamic mode.');
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
    if (!this.orientationMode) {
      return;
    }

    try {
      const new_orientation = calculateOrientation(
        state,
        this.orientationMode,
        this.geometry,
        velocity_,
      );
      const q = new THREE.Quaternion(...new_orientation); // xyzw
      this.geometry.setRotationFromQuaternion(q);
    } catch (error) {
      console.error('Error updating point orientation:', error);
    }
  }

  update(timestamp: Date, state: State): void {
    const tleLines = this.tle.split('\n');
    const satrec = satellite.twoline2satrec(tleLines[1], tleLines[2]);

    // Typing on  satellite.js is broken
    // eslint-disable-next-line
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

    this.position = [position_.x, position_.y, position_.z];

    // For satellites, we want to update the point's orientation
    this.updatePointOrientation(state, velocity_);

    // Update trail if it exists
    if (this.trail) {
      this.trail.update(this.geometry.position, this.cameraEcefAxis);
    }
  }
}
