import * as satellite from 'satellite.js';
import * as THREE from 'three';
import { _fetchTLE } from './core.js';
import { log } from './logger.js';
import { Vector3 } from './types.js';

export class Point {
  public geometry: THREE.Group;

  constructor(geometry: THREE.Group) {
    this.geometry = geometry;
  }

  get position(): Vector3 {
    const pos = this.geometry.position.clone();
    return [pos.x, pos.y, pos.z];
  }

  set position(pos: Vector3) {
    this.geometry.position.set(pos[0], pos[1], pos[2]);
  }
}

export class OrientedPoint extends Point {
  public camera_orientation?: [number, number, number, number];
  constructor(
    geometry: THREE.Group,
    camera_orientation?: [number, number, number, number],
  ) {
    super(geometry);

    if (camera_orientation !== undefined) {
      this.camera_orientation = camera_orientation;
      this.addCamera(10, camera_orientation);
    }
  }

  /**
   * Returns the local coordinate frame vectors (x, y, z) of the point.
   * Each vector is returned as a tuple of numbers.
   */
  get frame(): { x: Vector3; y: Vector3; z: Vector3 } {
    const quaternion = this.geometry.quaternion;

    const basisVectors = {
      x: new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).toArray(),
      y: new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion).toArray(),
      z: new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).toArray(),
    };
    return basisVectors;
  }

  addCamera(
    fov: number,
    camera_orientation: [number, number, number, number] = [0, 0, 0, 1],
  ): void {
    const hasCamera = this.geometry.children.some(
      (child) => child instanceof THREE.Camera && child.name === '_camera',
    );

    if (hasCamera) {
      throw new Error('A camera named "_camera" already exists in this group!');
    }

    let camera_orientation_in_body_frame = new THREE.Quaternion(
      camera_orientation[0],
      camera_orientation[1],
      camera_orientation[2],
      camera_orientation[3],
    );

    const camera = new THREE.PerspectiveCamera(fov, 1, 400, 500000);
    camera.name = '_camera';
    let camera_to_z_quaternion = new THREE.Quaternion();
    camera_to_z_quaternion.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      Math.PI,
    );
    camera.setRotationFromQuaternion(
      camera_orientation_in_body_frame.multiply(camera_to_z_quaternion),
    );
    this.geometry.add(camera);
  }

  get camera(): THREE.Camera | null {
    const camera = this.geometry.children.find(
      (child) => child instanceof THREE.Camera && child.name === '_camera',
    );

    if (!camera) {
      console.warn('No camera named "_camera" available in this group!');
      return null;
    }
    return camera as THREE.Camera;
  }

  get cameraBodyDirection(): Vector3 | null {
    let camera_quat_body = this.camera?.quaternion;
    const camera_default_dir = new THREE.Vector3(0, 0, -1);

    if (!camera_quat_body) {
      console.warn('No camera named "_camera" available in this group!');
      return null;
    }

    const camera_dir = camera_default_dir.applyQuaternion(camera_quat_body);

    return [camera_dir.x, camera_dir.y, camera_dir.z];
  }
}

export class Satellite extends OrientedPoint {
  private tle: string;

  constructor(
    geometry: THREE.Group,
    tle: string,
    camera_orientation?: [number, number, number, number],
  ) {
    super(geometry, camera_orientation);
    this.tle = tle;
  }

  static async fromNoradId(
    geometry: THREE.Group,
    noradId: string,
    camera_orientation?: [number, number, number, number],
  ): Promise<Satellite> {
    const result = await _fetchTLE(noradId);
    let tle: string;
    if (result.ok) {
      log(`Fetched and cached TLE for COSPAR ID: ${noradId}`);
      tle = result.val;
    } else {
      throw new Error(result.val);
    }
    return new Satellite(geometry, tle, camera_orientation);
  }

  updatePosition(timestamp: Date): void {
    const tleLines = this.tle.split('\n');
    const satrec = satellite.twoline2satrec(tleLines[1], tleLines[2]);

    if (!satrec) {
      throw new Error('Failed to parse TLE data');
    }

    const positionAndVelocity = satellite.propagate(satrec, timestamp);
    const position = positionAndVelocity.position;

    if (typeof position === 'boolean') {
      throw new Error('Failed to calculate satellite position');
    }

    // Convert ECI to ECEF coordinates
    const gmst = satellite.gstime(timestamp);
    const position_ = satellite.eciToEcf(position, gmst);

    this.position = [position_.x, position_.y, position_.z];
  }
}
