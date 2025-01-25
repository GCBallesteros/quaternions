import * as THREE from 'three';
import {
  _addPoint as _addPoint,
  _angle,
  _createLine,
  _fetchTLE,
  _findBestQuaternion,
  _mov,
  _mov2sat,
  _reset,
  _rot,
  _setTime,
} from './core.js';

import { Point } from './point.js';
import { CommandFunction, State, Vector3 } from './types.js';

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
  ): void {
    const result = _addPoint(scene, state, name, coordinates, quaternion);
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
    const result = await _fetchTLE(state, norad_id);
    if (result.ok) {
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

  function setTime(newTime: Date): void {
    _setTime(state, newTime);
  }

  function listPoints(): string[] {
    return Object.keys(state.points);
  }

  return {
    mov: mov,
    rot: rot,
    addPoint: addPoint,
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
  };
}
