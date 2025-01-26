import * as THREE from 'three';
import { OrientedPoint, Point } from './point.js';

export type Vector3 = [number, number, number];

export type CommandFunction = (...args: any[]) => any;

export interface Line {
  line: THREE.Line;
  start: Vector3 | string;
  end: Vector3 | string;
}

export interface State {
  points: Record<string, Point | OrientedPoint>;
  lines: Record<string, Line>;
  lights: {
    ambient: THREE.AmbientLight;
    sun: THREE.DirectionalLight;
  };
  currentTime: Date;
  tles: Record<string, string>;
  cameras: Record<string, THREE.PerspectiveCamera>;
  bodies: { moon: THREE.Mesh };
}
