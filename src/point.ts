import * as satellite from 'satellite.js';
import * as THREE from 'three';
import { _fetchTLE, _findBestQuaternion } from './core.js';
import { log } from './logger.js';
import { State, Vector3, Vector4 } from './types.js';

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

  get color(): string {
    const sphere = this.geometry.children.find(
      (child) => child instanceof THREE.Mesh && child.name === 'point-sphere',
    ) as THREE.Mesh;

    if (sphere && sphere.material instanceof THREE.MeshBasicMaterial) {
      return '#' + sphere.material.color.getHexString();
    }
    return '#ffffff';
  }

  set color(color: string) {
    const sphere = this.geometry.children.find(
      (child) => child instanceof THREE.Mesh && child.name === 'point-sphere',
    ) as THREE.Mesh;

    if (sphere && sphere.material instanceof THREE.MeshBasicMaterial) {
      sphere.material.color.set(color);
    }
  }
}

export class OrientedPoint extends Point {
  public camera_orientation?: Vector4;
  constructor(geometry: THREE.Group, camera_orientation?: Vector4) {
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
    this.camera_orientation = camera_orientation;

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

export type OrientationMode =
  | { type: 'fixed'; ecef_quaternion: [number, number, number, number] }
  | {
      type: 'dynamic';
      primaryBodyVector: Vector3 | string;
      secondaryBodyVector: Vector3 | string;
      primaryTargetVector: Vector3 | NamedTargets;
      secondaryTargetVector: Vector3 | NamedTargets;
    };

export type NamedTargets =
  | { type: 'Moon' }
  | { type: 'Sun' }
  | { type: 'Velocity' }
  | { type: 'Nadir' }
  | { type: 'TargetPointing'; target: Vector3 | string };

export namespace NamedTargets {
  export const Moon: NamedTargets = { type: 'Moon' };
  export const Sun: NamedTargets = { type: 'Sun' };
  export const Velocity: NamedTargets = { type: 'Velocity' };
  export const Nadir: NamedTargets = { type: 'Nadir' };
  export const TargetPointing = (target: Vector3 | string): NamedTargets => ({
    type: 'TargetPointing',
    target,
  });
}

export class Satellite extends OrientedPoint {
  private tle: string;
  private orientationMode: OrientationMode;

  private isNamedTarget(value: any): value is NamedTargets {
    return typeof value === 'object' && value !== null && 'type' in value;
  }

  private getTargetVector(
    namedTarget: NamedTargets,
    position_: THREE.Vector3,
    velocity_: THREE.Vector3,
    state: State,
  ): Vector3 {
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
          return new THREE.Vector3(...namedTarget.target)
            .clone()
            .sub(position_)
            .normalize()
            .toArray();
        }
    }
  }

  constructor(
    geometry: THREE.Group,
    tle: string,
    orientationMode: OrientationMode = {
      type: 'dynamic',
      primaryBodyVector: 'z',
      secondaryBodyVector: 'y',
      primaryTargetVector: NamedTargets.Nadir,
      secondaryTargetVector: NamedTargets.Velocity,
    },
    camera_orientation?: [number, number, number, number],
  ) {
    super(geometry, camera_orientation);
    this.tle = tle;
    this.orientationMode = orientationMode;
  }

  static async fromNoradId(
    geometry: THREE.Group,
    noradId: string,

    orientationMode: OrientationMode = {
      type: 'dynamic',
      primaryBodyVector: 'z',
      secondaryBodyVector: 'y',
      primaryTargetVector: NamedTargets.Nadir,
      secondaryTargetVector: NamedTargets.Velocity,
    },
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
    return new Satellite(geometry, tle, orientationMode, camera_orientation);
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

    let new_orientation: [number, number, number, number];
    switch (this.orientationMode.type) {
      case 'dynamic':
        let primaryTargetVector: Vector3;
        let secondaryTargetVector: Vector3;

        primaryTargetVector = this.isNamedTarget(
          this.orientationMode.primaryTargetVector,
        )
          ? this.getTargetVector(
              this.orientationMode.primaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : this.orientationMode.primaryTargetVector;

        secondaryTargetVector = this.isNamedTarget(
          this.orientationMode.secondaryTargetVector,
        )
          ? this.getTargetVector(
              this.orientationMode.secondaryTargetVector,
              position_,
              velocity_,
              state,
            )
          : this.orientationMode.secondaryTargetVector;

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
    const q = new THREE.Quaternion(...new_orientation); // xyzw
    this.geometry.setRotationFromQuaternion(q);
  }
}
