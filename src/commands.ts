import * as THREE from 'three';
import {
  _addPoint,
  _addSatellite,
  _angle,
  _createLine,
  _fetchTLE,
  _findBestQuaternion,
  _mov,
  _mov2sat,
  _pauseSimTime,
  _reset,
  _resumeSimTime,
  _rot,
  _setTime,
  _toggleSimTime,
} from './core.js';
import { log } from './logger.js';
import { OrientationMode, Point } from './point.js';
import { CommandFunction, State, TleSource, Vector3 } from './types.js';
import { updateTimeDisplay } from './ui.js';
import {
  geo2xyz,
  getPositionOfPoint,
  sph2xyz,
  validateName,
  xyz2geo,
  xyz2sph,
} from './utils.js';

export function buildCommandClosures(
  scene: THREE.Scene,
  state: State,
  switchCamera: (newCamera: THREE.PerspectiveCamera) => void,
): Record<string, CommandFunction> {
  function mov(
    point_name: string,
    pos: Vector3,
    use_geo: boolean = false,
  ): void {
    const result = _mov(state, point_name, pos, use_geo);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function rot(point_name: string, q: [number, number, number, number]): void {
    const result = _rot(state, point_name, q);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function addPoint(
    name: string,
    coordinates: Vector3,
    quaternion = null,
    color = '#ffffff'
  ): void {
    const result = _addPoint(scene, state, name, coordinates, quaternion, color);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  async function addSatellite(
    name: string,
    tleSource: TleSource,
    orientationMode: OrientationMode,
  ): Promise<void> {
    const result = await _addSatellite(
      scene,
      state,
      name,
      tleSource,
      orientationMode,
    );
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function createLine(
    name: string,
    startArg: string | Vector3,
    endArg: string | Vector3,
  ): void {
    const result = _createLine(scene, state, name, startArg, endArg);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function angle(vec1: string | Vector3, vec2: string | Vector3): number {
    const result = _angle(state, vec1, vec2);
    if (result.ok) {
      return result.val;
    } else {
      throw new Error(result.val);
    }
  }

  function rad2deg(x: number): number {
    return (x * 180) / Math.PI;
  }

  function deg2rad(x: number): number {
    return (x * Math.PI) / 180;
  }

  async function fetchTLE(norad_id: string): Promise<string> {
    // Check if TLE data already exists in the cache
    if (state.tles[norad_id]) {
      log(`Using cached TLE for COSPAR ID: ${norad_id}`);
      return state.tles[norad_id];
    }

    const result = await _fetchTLE(norad_id);
    if (result.ok) {
      // Cache the fetched TLE in the state variable under the COSPAR ID
      state.tles[norad_id] = result.val;
      log(`Fetched and cached TLE for COSPAR ID: ${norad_id}`);
      return result.val;
    } else {
      throw new Error(result.val);
    }
  }

  async function mov2sat(
    name: string,
    cosparId: string,
    timestamp: Date,
  ): Promise<void> {
    const result = await _mov2sat(state, name, cosparId, timestamp);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function findBestQuaternion(
    primaryBodyVector: Vector3 | string,
    secondaryBodyVector: Vector3 | string,
    primaryTargetVector: Vector3 | string,
    secondaryTargetVector: Vector3 | string,
  ): [number, number, number, number] {
    const result = _findBestQuaternion(
      state,
      primaryBodyVector,
      secondaryBodyVector,
      primaryTargetVector,
      secondaryTargetVector,
    );
    if (result.ok) {
      return result.val;
    } else {
      throw new Error(result.val);
    }
  }

  function point(point: string): Point {
    if (!point || typeof point !== 'string') {
      throw new Error('Point name must be a non-empty string');
    }

    if (!(point in state.points)) {
      throw new Error(`Point '${point}' not found`);
    }

    return state.points[point];
  }

  function reset(): void {
    _reset(scene, state, switchCamera);
  }

  function resumeSimTime(): void {
    const result = _resumeSimTime(state);
    if (!result.ok) {
      throw new Error(result.val);
    }
  }

  function pauseSimTime(): void {
    const result = _pauseSimTime(state);
    if (!result.ok) {
      throw new Error(result.val);
    }
  }

  function toggleSimTime(): void {
    const result = _toggleSimTime(state);
    if (!result.ok) {
      throw new Error(result.val);
    }
  }

  function setTime(newTime: Date): void {
    const result = _setTime(state, newTime);
    if (!result.ok) {
      throw new Error(result.val);
    }
    updateTimeDisplay(state);
  }

  function listPoints(): string[] {
    return Object.keys(state.points);
  }

  function deletePoint(name: string): void {
    const result = _deletePoint(scene, state, name);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  return {
    mov: mov,
    rot: rot,
    addPoint: addPoint,
    deletePoint: deletePoint,
    addSatellite: addSatellite,
    createLine: createLine,
    angle: angle,
    rad2deg: rad2deg,
    deg2rad: deg2rad,
    fetchTLE: fetchTLE,
    mov2sat: mov2sat,
    findBestQuaternion: findBestQuaternion,
    point: point,
    reset: reset,
    setTime: setTime,
    listPoints: listPoints,
    resumeSimTime: resumeSimTime,
    pauseSimTime: pauseSimTime,
    toggleSimTime: toggleSimTime,
    // Add utility functions to commands
    geo2xyz: geo2xyz,
    getPositionOfPoint: getPositionOfPoint,
    sph2xyz: sph2xyz,
    validateName: validateName,
    xyz2geo: xyz2geo,
    xyz2sph: xyz2sph,
  };
}
