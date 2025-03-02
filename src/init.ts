// AI
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { None } from 'ts-results';
import { getMoonPosition } from './astronomy/moon.js';
import { updateSunLight } from './astronomy/sun.js';
import { createFloatingPoint } from './components.js';
import { setupTimeControls } from './components/timeControls.js';
import { _createLine, _mov, _setTime, addFrame } from './core.js';
import { makeEarth } from './earth.js';
import { makeMoon } from './moon.js';
import { updatePlots } from './plots.js';
import { State } from './types.js';

/**
 * Determines if a camera other than the main camera is currently rendering the scene
 * @param state The current application state
 * @returns True if a non-main camera is active in either main or secondary view, false otherwise
 */
export function isNonMainCameraActive(state: State): boolean {
  // Check if the active camera is different from the main camera
  const isMainViewUsingNonMainCamera =
    state.activeCamera !== state.cameras.main;

  // Check if secondary view is visible and using a non-main camera
  const secondaryView = document.getElementById('secondary-view');
  const isSecondaryViewActive =
    !secondaryView?.classList.contains('hidden') &&
    state.secondaryCamera.some &&
    state.secondaryCamera.val !== state.cameras.main;

  return isMainViewUsingNonMainCamera || isSecondaryViewActive;
}

export function initializeCanvas(
  canvas: HTMLCanvasElement,
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  return renderer;
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
    1,
    30000,
  );
  camera.position.set(14000, 2000, 2000);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.layers.enable(1);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 7.0);
  scene.add(sunLight);

  // Initialize Moon
  const moon = makeMoon();
  scene.add(moon);

  // Initialize Earth
  let earth_geometries = makeEarth();
  scene.add(earth_geometries.earth);
  scene.add(earth_geometries.earth_frame);

  let state: State = {
    points: {},
    lines: {},
    lights: { ambient: ambientLight, sun: sunLight },
    tles: {},
    currentTime: new Date(),
    isTimeFlowing: true,
    timeSpeedMultiplier: 2,
    cameras: { main: camera },
    activeCamera: camera,
    secondaryCamera: None,
    bodies: { moon, earth: earth_geometries.earth },
    plots: {},
    _webmercatorTiles: new Set(),
  };

  const moonPos = getMoonPosition(state.currentTime);
  state.bodies.moon.position.set(...moonPos.position);

  updateSunLight(state.lights.sun, state.currentTime);

  // Add initial geometries
  addInitGeometries(state, scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  controls.minDistance = 8000;
  controls.maxDistance = 20000;

  setupTimeControls(state);
  return state;
}

export function createAnimator(
  renderer: THREE.WebGLRenderer,
  secondaryRenderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  state: State,
  initialCamera: THREE.PerspectiveCamera,
  canvas: HTMLElement,
): (newCamera: THREE.PerspectiveCamera) => void {
  state.activeCamera = initialCamera;

  const clock = new THREE.Clock();
  let frameCount = 0;
  function animate() {
    const elapsed = clock.getDelta();
    if (state.isTimeFlowing) {
      const simulatedTime = new Date(
        state.currentTime.getTime() +
          elapsed * state.timeSpeedMultiplier * 1000,
      );
      _setTime(state, simulatedTime);
    }

    // Update all plots when time is flowing
    if (state.isTimeFlowing) {
      frameCount++;
      updatePlots(state, frameCount);
      frameCount = frameCount % 1000; // Prevent potential overflow
    }

    // Render main view
    renderer.render(scene, state.activeCamera);

    // Render secondary view if camera is available
    const secondaryView = document.getElementById('secondary-view');
    if (
      !secondaryView?.classList.contains('hidden') &&
      state.secondaryCamera.some
    ) {
      secondaryRenderer.render(scene, state.secondaryCamera.val);
    }
  }
  renderer.setAnimationLoop(animate);

  return function switchCamera(newCamera: THREE.PerspectiveCamera) {
    if (!(newCamera instanceof THREE.PerspectiveCamera)) {
      throw new Error(
        'Invalid camera: switchCamera requires a PerspectiveCamera instance',
      );
    }
    // Update aspect ratio to match canvas
    newCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    newCamera.updateProjectionMatrix();
    state.activeCamera = newCamera;
  };
}
