import * as THREE from 'three';

export type Vector3 = [number, number, number];

export type CommandFunction = (...args: any[]) => any;

export interface Line {
  line: THREE.Line;
  start: Vector3 | string;
  end: Vector3 | string;
}

export interface State {
  points: Record<string, THREE.Group>;
  lines: Record<string, Line>;
  tles: Record<string, string>;
}
