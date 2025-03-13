import * as satellite from 'satellite.js';
import * as THREE from 'three';

import { _fetchTLE } from '../core.js';
import { log } from '../logger.js';
import { Trail } from '../trail.js';
import { State } from '../types.js';
import { OrientationMode } from '../types/orientation.js';

import { CameraConfig, OrientedPoint } from './orientedPoint.js';

export class Satellite extends OrientedPoint {
  private tle: string;
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

  constructor(
    scene: THREE.Scene,
    geometry: THREE.Group,
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
    super(geometry, cameraConfig, orientationMode, null);
    this.tle = tle;

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
    return new Satellite(scene, geometry, tle, orientationMode, cameraConfig);
  }

  set offset(offset: [number, number, number, number]) {
    if (this._pointOrientationMode?.type === 'dynamic') {
      this._pointOrientationMode.offset = offset;
    } else {
      log('Trying to set orientation offset on non-dynamic mode.');
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

    // Also update the camera orientation if it exists
    if (this.camera) {
      this.updateOrientation(state, velocity_);
    }

    // Update trail if it exists
    if (this.trail) {
      this.trail.update(this.geometry.position, this.cameraEcefAxis);
    }
  }
}
