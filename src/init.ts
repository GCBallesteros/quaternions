import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { updateSunLight } from './astronomy/sun.js';
import { getMoonPosition } from './astronomy/moon.js';
import { makeMoon } from './moon.js';
import { createFloatingPoint } from './components.js';
import { _createLine, _mov, addFrame } from './core.js';
import { makeEarth } from './earth.js';
import { State } from './types.js';

export function initializeCanvas(): {
  scene: THREE.Scene;
  canvas: HTMLElement;
  renderer: THREE.WebGLRenderer;
} {
  const canvas = document.getElementById('webgl-canvas')!;
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  return { scene, canvas, renderer };
}

export function addInitGeometries(state: State, scene: THREE.Scene): void {
  state.points['sat'] = addFrame(createFloatingPoint());
  scene.add(state.points['sat'].geometry);
  _mov(state, 'sat', [39, 0, 500], true);
  _createLine(scene, state, 'nadir', [0, 0, 0], 'sat');
}

export function initScene(
  scene: THREE.Scene,
  canvas: HTMLElement,
  renderer: THREE.WebGLRenderer,
): State {
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100000,
  );
  camera.position.set(14000, 2000, 2000);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 7.0);
  scene.add(sunLight);

  // Initialize Moon
  const moon = makeMoon();
  scene.add(moon);

  let state: State = {
    points: {},
    lines: {},
    lights: { ambient: ambientLight, sun: sunLight },
    tles: {},
    currentTime: new Date(),
    cameras: { main: camera },
    bodies: { moon },
  };

  const moonPos = getMoonPosition(state.currentTime);
  state.bodies.moon.position.set(...moonPos.position);

  updateSunLight(state.lights.sun, state.currentTime);

  let earth_geometries = makeEarth();
  scene.add(earth_geometries.earth);
  scene.add(earth_geometries.earth_frame);

  // Add initial geometries
  addInitGeometries(state, scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  controls.minDistance = 8000;
  controls.maxDistance = 20000;

  return state;
}

export function createAnimator(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  initialCamera: THREE.PerspectiveCamera,
): (newCamera: THREE.PerspectiveCamera) => void {
  let currentCamera = initialCamera;

  function animate() {
    renderer.render(scene, currentCamera);
  }
  renderer.setAnimationLoop(animate);

  return function switchCamera(newCamera: THREE.PerspectiveCamera) {
    currentCamera = newCamera; // Change the camera within the closure
  };
}
