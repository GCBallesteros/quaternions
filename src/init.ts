import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { None, Option, Some } from 'ts-results';

import { addWebMercatorTile } from './addMercatorTiles.js';
import { getMoonPosition } from './astronomy/moon.js';
import { updateSunLight } from './astronomy/sun.js';
import { CircularBuffer } from './circularBuffer.js';
import { setupTimeControls } from './components/timeControls.js';
import { _createLine, _mov, _setTime } from './core.js';
import { makeEarth } from './earth.js';
import { findMercatorTilesInPOV } from './findMercatorTiles.js';
import { makeMoon } from './moon.js';
import { updatePlots } from './plots.js';
import { Point } from './points/point.js';
import { State, TileCoordinate } from './types.js';
import { OrientedPoint } from './points/orientedPoint.js';

/**
 * Recursively sets the visibility of all meshes in a group.
 *
 * @param {THREE.Object3D} object - The parent object to traverse.
 * @param {boolean} visible - Whether to show or hide the meshes.
 */
function setGroupVisibility(object: THREE.Object3D, visible: boolean): void {
  object.children.forEach((child) => {
    // This casting to it is ugly but the typing of threeJS is complicated
    if ((child as THREE.Mesh).isMesh) {
      child.visible = visible;
    } else if (child instanceof THREE.Group) {
      setGroupVisibility(child, visible); // Recursively handle nested groups
    }
  });
}

/**
 * Determines if a camera other than the main camera is currently rendering the scene
 * @param state The current application state
 * @returns True if a non-main camera is active in either main or secondary view, false otherwise
 */
function isNonMainCameraActive(state: State): boolean {
  // Check if the active camera is different from the main camera
  const isMainViewUsingNonMainCamera =
    state.activeCamera !== state.cameras.main;

  // Check if secondary view is visible and using a non-main camera
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const secondaryView = document.getElementById('secondary-view')!;
  const isSecondaryViewActive =
    !secondaryView?.classList.contains('hidden') &&
    state.secondaryCamera.some &&
    state.secondaryCamera.val !== state.cameras.main;

  return isMainViewUsingNonMainCamera || isSecondaryViewActive;
}

/**
 * Gets visible mercator tiles for active non-main cameras
 * @param state The current application state
 * @returns Option containing array of [x,y] tile coordinates or None if no tiles should be loaded
 */
function getVisibleMercatorTiles(state: State): Option<TileCoordinate[]> {
  // Only load tiles when non-main cameras are active and time is not flowing
  if (!isNonMainCameraActive(state) || state.isTimeFlowing) {
    return None;
  }

  // Only fetch tiles if camera is close enough to Earth (within 20000 units)
  const cameraPos = new THREE.Vector3();
  state.activeCamera.getWorldPosition(cameraPos);
  const cameraDistance = cameraPos.length();

  if (cameraDistance >= 20000) {
    return None;
  }

  const visibleTiles: TileCoordinate[] = [];

  // Process main view camera if it's not the main camera
  if (state.activeCamera !== state.cameras.main) {
    const mainViewTiles = findMercatorTilesInPOV(state.activeCamera);
    visibleTiles.push(...mainViewTiles);
  }

  // Process secondary view camera if it exists, is visible, and is not the main camera
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const secondaryView = document.getElementById('secondary-view')!;
  if (
    !secondaryView?.classList.contains('hidden') &&
    state.secondaryCamera.some &&
    state.secondaryCamera.val !== state.cameras.main
  ) {
    const secondaryViewTiles = findMercatorTilesInPOV(
      state.secondaryCamera.val,
    );
    visibleTiles.push(...secondaryViewTiles);
  }

  return visibleTiles.length > 0 ? Some(visibleTiles) : None;
}

export function initializeCanvas(
  canvas: HTMLCanvasElement,
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    //logarithmicDepthBuffer: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  return renderer;
}

export function addInitGeometries(state: State, scene: THREE.Scene): void {
  state.points['sat'] = new OrientedPoint([0, 0, 0, 1]);
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
  const earth_geometries = makeEarth();
  scene.add(earth_geometries.earth);
  scene.add(earth_geometries.earth_frame);

  const state: State = {
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
    _webmercatorTilesQueue: new CircularBuffer<string>(512),
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
  let tileUpdateCounter = 0;
  const TILE_UPDATE_FREQUENCY = 5; // Update tiles every 5 frames

  function animate(): void {
    const elapsed = clock.getDelta();
    if (state.isTimeFlowing) {
      const simulatedTime = new Date(
        state.currentTime.getTime() +
          elapsed * state.timeSpeedMultiplier * 1000,
      );
      _setTime(state, simulatedTime);
    }

    // Increment frame counters
    tileUpdateCounter++;

    // Handle high-resolution tile loading (throttled to every 5 frames)
    if (tileUpdateCounter >= TILE_UPDATE_FREQUENCY) {
      const visibleTiles = getVisibleMercatorTiles(state);
      if (visibleTiles.some) {
        for (const [x, y] of visibleTiles.val) {
          // Use zoom level 8 as specified in findMercatorTiles.ts
          addWebMercatorTile(x, y, 8, scene, state);
        }
      }
      tileUpdateCounter = 0; // Reset the counter after updating
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const secondaryView = document.getElementById('secondary-view')!;
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

    // Switch off the geometry associated with the camera
    if (newCamera.parent && newCamera.parent instanceof THREE.Group) {
      setGroupVisibility(newCamera.parent, false);
    }
    // Switch on any geometry that might have been turned off previously
    if (
      state.activeCamera.parent &&
      state.activeCamera.parent instanceof THREE.Group
    ) {
      setGroupVisibility(state.activeCamera.parent, true);
    }

    state.activeCamera = newCamera;
  };
}
