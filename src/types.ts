import * as THREE from 'three';
import { Option } from 'ts-results';

import { CircularBuffer } from './circularBuffer.js';
import { OrientedPoint } from './points/orientedPoint.js';
import { Point } from './points/point.js';

export type Array3 = [number, number, number];
export type Array4 = [number, number, number, number];
export type TileCoordinate = [number, number];

export interface Plot {
  title: string;
  lines: string[];
  data: {
    timestamps: number[];
    values: Record<string, number[]>;
    maxPoints: number; // Maximum number of points to store
    currentIndex: number; // Current position in array
  };
  callback: () => number[];
  sampleEvery: number; // How many animation frames between samples
  lastSample: number; // Frame count of last sample
  lastSentIndex: number; // Last index sent to worker
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandFunction = (...args: any[]) => any;

export type TleSource =
  | { type: 'tle'; tle: string }
  | { type: 'noradId'; noradId: string };

export interface Line {
  line: THREE.Line;
  start: Array3 | string;
  end: Array3 | string;
}

export interface State {
  points: Record<string, Point>;
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
  activeCamera: THREE.PerspectiveCamera;
  secondaryCamera: Option<THREE.PerspectiveCamera>;
  bodies: { moon: THREE.Mesh; earth: THREE.Mesh };
  plots: Record<string, Plot>;
  _webmercatorTiles: Set<string>;
  _webmercatorTilesQueue: CircularBuffer<string>;
}
