import * as THREE from 'three';
import {
  _addPoint,
  _addSatellite,
  _angle,
  _createLine,
  _createPlot,
  _deletePoint,
  _fetchTLE,
  _findBestQuaternion,
  _hideSecondaryView,
  _mov,
  _mov2sat,
  _pauseSimTime,
  _pauseTrail,
  _relativeRot,
  _removePlot,
  _reset,
  _resumeSimTime,
  _resumeTrail,
  _rot,
  _setTime,
  _showSecondaryView,
  _toggleSimTime,
  _toggleTrail,
} from './core.js';
import { findMercatorTilesInPOV } from './findMercatorTiles.js';
import { addWebMercatorTile as _addWebMercatorTile } from './addMercatorTiles.js';
import { log } from './logger.js';
import { OrientedPoint } from './points/orientedPoint.js';
import { Point } from './points/point.js';
import { OrientationMode } from './points/satellite.js';
import { updateTrailSwitch } from './trail.js';
import { Array3, CommandFunction, State, TleSource, Vector4 } from './types.js';
import {
  geo2xyz,
  getPositionOfPoint,
  normalizeCoordinates,
  sph2xyz,
  utcDate,
  validateName,
  xyz2geo,
  xyz2sph,
  zyxToQuaternion,
} from './utils.js';
import { Vector3 } from './vectors.js';

export function buildCommandClosures(
  scene: THREE.Scene,
  state: State,
  switchCamera: (newCamera: THREE.PerspectiveCamera) => void,
): Record<string, CommandFunction> {
  function mov(
    point_name: string,
    pos: Array3 | Vector3,
    use_geo: boolean = false,
  ): void {
    let normalized_pos = normalizeCoordinates(pos);

    const result = _mov(state, point_name, normalized_pos, use_geo);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function rot(point_name: string, q: Vector4): void {
    const result = _rot(state, point_name, q);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function addPoint(
    name: string,
    coordinates: Array3 | Vector3,
    quaternion = null,
    color = '#ffffff',
  ): void {
    let normalized_coordinates = normalizeCoordinates(coordinates);

    const result = _addPoint(
      scene,
      state,
      name,
      normalized_coordinates,
      quaternion,
      color,
    );
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
    cameraConfig?: {
      orientation: [number, number, number, number];
      fov: number;
    },
  ): Promise<void> {
    const result = await _addSatellite(
      scene,
      state,
      name,
      tleSource,
      orientationMode,
      cameraConfig,
    );
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function createLine(
    name: string,
    startArg: string | Array3 | Vector3,
    endArg: string | Array3 | Vector3,
  ): void {
    let startArg_ = normalizeCoordinates(startArg, true);
    let endArg_ = normalizeCoordinates(endArg, true);

    const result = _createLine(scene, state, name, startArg_, endArg_);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function angle(
    vec1: string | Array3 | Vector3,
    vec2: string | Array3 | Vector3,
  ): number {
    let vec1_ = normalizeCoordinates(vec1, true);
    let vec2_ = normalizeCoordinates(vec2, true);

    const result = _angle(state, vec1_, vec2_);
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
    primaryBodyVector: Array3 | string | Vector3,
    secondaryBodyVector: Array3 | string | Vector3,
    primaryTargetVector: Array3 | string | Vector3,
    secondaryTargetVector: Array3 | string | Vector3,
  ): [number, number, number, number] {
    const result = _findBestQuaternion(
      state,
      normalizeCoordinates(primaryBodyVector, true),
      normalizeCoordinates(secondaryBodyVector, true),
      normalizeCoordinates(primaryTargetVector, true),
      normalizeCoordinates(secondaryTargetVector, true),
    );
    if (result.ok) {
      return result.val;
    } else {
      throw new Error(result.val);
    }
  }

  function point(point: string): Point | null {
    if (!point || typeof point !== 'string') {
      throw new Error('Point name must be a non-empty string');
    }

    if (!(point in state.points)) {
      log(`Point '${point}' not found`);
      return null;
    }

    return state.points[point];
  }

  function camera(name: string): THREE.Camera | null {
    if (!name || typeof name !== 'string') {
      throw new Error('Camera name must be a non-empty string');
    }

    // First check built-in cameras
    if (name in state.cameras) {
      return state.cameras[name];
    }

    // Then check points for cameras
    for (const pointName in state.points) {
      const point = state.points[pointName];
      if (point instanceof OrientedPoint) {
        if (pointName === name && point.hasCamera) {
          const camera = point.camera;
          if (camera) {
            return camera;
          }
        }
      }
    }

    log(`Camera '${name}' not found in cameras or points`);
    return null;
  }

  function relativeRot(point_name: string, q: Vector4): void {
    const result = _relativeRot(state, point_name, q);
    if (result.ok) {
      return;
    } else {
      throw new Error(result.val);
    }
  }

  function reset(cleanupPlots: boolean = false): void {
    _reset(scene, state, switchCamera, cleanupPlots);
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

  function resumeTrail(satelliteName: string): void {
    const result = _resumeTrail(state, satelliteName);
    if (!result.ok) throw new Error(result.val);
    updateTrailSwitch(satelliteName, true);
  }

  function pauseTrail(satelliteName: string): void {
    const result = _pauseTrail(state, satelliteName);
    if (!result.ok) throw new Error(result.val);
    updateTrailSwitch(satelliteName, false);
  }

  function toggleTrail(satelliteName: string): void {
    const result = _toggleTrail(state, satelliteName);
    if (!result.ok) throw new Error(result.val);
    updateTrailSwitch(satelliteName, result.val);
  }

  function createPlot(
    id: string,
    config: { title: string; lines: string[]; sampleEvery?: number },
    callback: () => number[],
  ): void {
    const result = _createPlot(state, id, config, callback);
    if (!result.ok) throw new Error(result.val);
  }

  function removePlot(id: string): void {
    const result = _removePlot(state, id);
    if (!result.ok) throw new Error(result.val);
  }

  // AI! Create _showSecondaryView on core.ts and use it here. The purpose of this is to be able to pass to it the state and camera to update the secondary camera.
  function showSecondaryView(camera: THREE.PerspectiveCamera): void {
    const result = _showSecondaryView(state, camera);
    if (!result.ok) {
      throw new Error(result.val);
    }
  }

  function hideSecondaryView(): void {
    _hideSecondaryView();
  }

  function addWebMercatorTile(x: number, y: number, z: number): void {
    const result = _addWebMercatorTile(x, y, z, scene, state);

    if (!result.ok) {
      throw new Error(result.val);
    }
  }

  async function longRunning(iterations: number = 100000000): Promise<void> {
    const worker = new Worker(
      new URL('./workers/longRunningWorker.ts', import.meta.url),
      { type: 'module' },
    );

    log('Starting long calculation...');

    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        const { result } = e.data;
        log(`Calculation complete! Result: ${result}`);
        worker.terminate();
        resolve();
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };

      worker.postMessage({ iterations });
    });
  }

  return {
    mov,
    rot,
    addPoint,
    deletePoint,
    addSatellite,
    createLine,
    angle,
    rad2deg,
    deg2rad,
    fetchTLE,
    mov2sat,
    findBestQuaternion,
    point,
    camera,
    reset,
    setTime,
    listPoints,
    resumeSimTime,
    pauseSimTime,
    toggleSimTime,
    longRunning,
    relativeRot,
    createPlot,
    removePlot,
    resumeTrail,
    pauseTrail,
    toggleTrail,
    showSecondaryView,
    hideSecondaryView,
    // Add utility functions to commands
    zyxToQuaternion,
    geo2xyz,
    getPositionOfPoint,
    sph2xyz,
    validateName,
    xyz2geo,
    xyz2sph,
    utcDate: (...args: Parameters<typeof utcDate>) => {
      const result = utcDate(...args);
      if (!result.ok) {
        throw new Error(result.val);
      }
      return result.val;
    },
    // Other functions
    findMercatorTilesInPOV,
    addWebMercatorTile,
  };
}
