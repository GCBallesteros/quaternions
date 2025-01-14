import * as THREE from 'three';
import {
  _add_point,
  _angle,
  _create_line,
  _fetchTLE,
  _findBestQuaternion,
  _mov,
  _mov2sat,
  _reset,
  _rot,
} from './core.js';
import { _help } from './help.js';

import { logToOutput } from './logger.js';
import { Point } from './point.js';
import { CommandFunction, State, Vector3 } from './types.js';

export function buildCommandClosures(
  scene: THREE.Scene,
  state: State,
): Record<string, CommandFunction> {
  function mov(
    point_name: string,
    pos: Vector3,
    use_geo: boolean = false,
  ): void {
    _mov(state, point_name, pos, use_geo);
  }

  function rot(point_name: string, q: [number, number, number, number]): void {
    _rot(state, point_name, q);
  }

  function add_point(name: string, coordinates: Vector3, quaternion = null) {
    _add_point(scene, state, name, coordinates, quaternion);
  }

  function create_line(
    name: string,
    startArg: string | Vector3,
    endArg: string | Vector3,
  ) {
    _create_line(scene, state, name, startArg, endArg);
  }

  function angle(vec1: string | Vector3, vec2: string | Vector3) {
    return _angle(state, vec1, vec2);
  }

  function rad2deg(x: number): number {
    return (x * 180) / Math.PI;
  }

  function deg2rad(x: number): number {
    return (x * Math.PI) / 180;
  }

  async function fetchTLE(norad_id: string): Promise<string> {
    return _fetchTLE(state, norad_id);
  }

  async function mov2sat(
    name: string,
    cosparId: string,
    timestamp: Date,
  ): Promise<void> {
    _mov2sat(state, name, cosparId, timestamp);
  }

  function findBestQuaternion(
    primaryBodyVector: Vector3 | string,
    secondaryBodyVector: Vector3 | string,
    primaryTargetVector: Vector3 | string,
    secondaryTargetVector: Vector3 | string,
  ): [number, number, number, number] | null {
    return _findBestQuaternion(
      state,
      primaryBodyVector,
      secondaryBodyVector,
      primaryTargetVector,
      secondaryTargetVector,
    );
  }

  function point(point: string): Point | null {
    // Ensure the point exists in the state
    if (!(point in state.points)) {
      logToOutput('Point not available in the state.');
      return null;
    }
    return state.points[point];
  }

  function help(commandName: string): void {
    _help(commandName);
  }

  function reset(): void {
    _reset(scene, state);
  }

  return {
    mov: mov,
    rot: rot,
    add_point: add_point,
    create_line: create_line,
    angle: angle,
    rad2deg: rad2deg,
    deg2rad: deg2rad,
    fetchTLE: fetchTLE,
    mov2sat: mov2sat,
    findBestQuaternion: findBestQuaternion,
    point: point,
    help: help,
    reset: reset,
  };
}
