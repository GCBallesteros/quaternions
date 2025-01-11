import * as THREE from 'three';
import {
  _add_point,
  _angle,
  _create_line,
  _fetchTLE,
  _findBestQuaternion,
  _frame,
  _mov,
  _mov2sat,
  _reset,
  _rot,
} from './core.js';
import { _help } from './help.js';

import { CommandFunction } from './types.js';

export function buildCommandClosures(
  scene: THREE.Scene,
  state,
): Record<string, CommandFunction> {
  function mov(point_name, pos, use_geo = false) {
    _mov(state, point_name, pos, use_geo);
  }

  function rot(point_name, q) {
    _rot(state, point_name, q);
  }

  function add_point(name, coordinates, quaternion = null) {
    _add_point(scene, state, name, coordinates, quaternion);
  }

  function create_line(name, startArg, endArg) {
    _create_line(scene, state, name, startArg, endArg);
  }

  function angle(vec1, vec2) {
    return _angle(state, vec1, vec2);
  }

  function rad2deg(x) {
    return (x * 180) / Math.PI;
  }

  function deg2rad(x) {
    return (x * Math.PI) / 180;
  }

  async function fetchTLE(norad_id) {
    return _fetchTLE(state, norad_id);
  }

  async function mov2sat(name, cosparId, timestamp) {
    _mov2sat(state, name, cosparId, timestamp);
  }

  function findBestQuaternion(
    primaryBodyVector: [number, number, number] | string,
    secondaryBodyVector: [number, number, number] | string,
    primaryTargetVector: [number, number, number] | string,
    secondaryTargetVector: [number, number, number] | string,
  ): [number, number, number, number] {
    return _findBestQuaternion(
      state,
      primaryBodyVector,
      secondaryBodyVector,
      primaryTargetVector,
      secondaryTargetVector,
    );
  }

  function frame(point: string): {
    x: THREE.Vector3Tuple;
    y: THREE.Vector3Tuple;
    z: THREE.Vector3Tuple;
  } {
    return _frame(state, point);
  }

  function help(commandName) {
    _help(commandName);
  }

  function reset() {
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
    frame: frame,
    help: help,
    reset: reset,
  };
}
