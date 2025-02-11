import * as THREE from 'three';
import { OrientedPoint } from './points/orientedPoint.js';
import { Point } from './points/point.js';

export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];

export interface Plot {
  title: string;
  lines: string[];
  data: {
    timestamps: number[];
    values: Record<string, number[]>;
    maxPoints: number;  // Maximum number of points to store
    currentIndex: number;  // Current position in circular buffer
  };
  callback: () => number[];
  sampleEvery: number; // How many animation frames between samples
  lastSample: number; // Frame count of last sample
}

export type CommandFunction = (...args: any[]) => any;

export type TleSource =
  | { type: 'tle'; tle: string }
  | { type: 'noradId'; noradId: string };

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
  isTimeFlowing: boolean;
  timeSpeedMultiplier: number;
  tles: Record<string, string>;
  cameras: Record<string, THREE.PerspectiveCamera>;
  bodies: { moon: THREE.Mesh; earth: THREE.Mesh };
  plots: Record<string, Plot>;
}
