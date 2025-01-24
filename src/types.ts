import * as THREE from 'three';
import { OrientedPoint, Point } from './point.js';

export type Vector3 = [number, number, number];

export type CommandFunction = (...args: any[]) => any;

export interface Line {
  line: THREE.Line;
  start: Vector3 | string;
  end: Vector3 | string;
}

// AI! I want to add the current time within the simulation to the State. Then I will need you to create a function named setTime that modifies the state of the function. This should be added to core.ts and commands.ts following the current pattern.
export interface State {
  points: Record<string, Point | OrientedPoint>;
  lines: Record<string, Line>;
  tles: Record<string, string>;
  cameras: Record<string, THREE.PerspectiveCamera>;
}
