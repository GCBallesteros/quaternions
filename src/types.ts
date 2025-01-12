import * as THREE from 'three';

export type CommandFunction = (...args: any[]) => any;

export interface Line {
  line: THREE.Line;
  start: [number, number, number] | string;
  end: [number, number, number] | string;
  geometry: THREE.BufferGeometry;
}

export interface State {
  points: Record<string, THREE.Group>;
  lines: Record<string, Line>;
  tles: Record<string, string>;
}
