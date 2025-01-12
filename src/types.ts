import * as THREE from 'three';

export type Vector3 = [number, number, number]

export type CommandFunction = (...args: any[]) => any;

export interface Line {
  line: THREE.Line;
  start: [number, number, number] | string;
  end: [number, number, number] | string;
}

export interface State {
  points: Record<string, THREE.Group>;
  lines: Record<string, Line>;
  tles: Record<string, string>;
}
