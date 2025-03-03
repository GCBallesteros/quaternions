import * as THREE from 'three';
import { buildCommandClosures } from './commands.js';
import { createAnimator, initScene, initializeCanvas } from './init.js';
import { log } from './logger.js';
import { buildExecuteCommand } from './terminal.js';
import { setupUI } from './ui.js';
import { setupCheatsheet } from './ui/cheatsheet.js';
import { getPositionOfPoint } from './utils.js';

// TODO: Better names spec findBestQuaternion computeOptimalQuaternion?
// TODO: Add diagram to findBestQuaternion documentation
// TODO: Get rid rot functions
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Transition smoothly between cameras (maybe)

const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const secondaryCanvas = document.getElementById(
  'secondary-canvas'
) as HTMLCanvasElement;

const renderer = initializeCanvas(canvas);
const secondaryRenderer = initializeCanvas(secondaryCanvas);

const scene = new THREE.Scene();
const state = initScene(scene, canvas, renderer);
const camera = state.cameras.main;
const switchCamera = createAnimator(
  renderer,
  secondaryRenderer,
  scene,
  state,
  camera,
  canvas
);

const commands = buildCommandClosures(scene, state, switchCamera);

const executeCommand = buildExecuteCommand(commands, state, switchCamera);

// Update all lines in the registry before each render
function updateAllLines(): void {
  for (const lineName in state.lines) {
    const { line, start, end } = state.lines[lineName];

    const startPos = getPositionOfPoint(state, start);
    const endPos = getPositionOfPoint(state, end);

    if (startPos && endPos) {
      // Update the line geometry's positions
      line.geometry.attributes.position.setXYZ(
        0,
        startPos.x,
        startPos.y,
        startPos.z
      );
      line.geometry.attributes.position.setXYZ(1, endPos.x, endPos.y, endPos.z);
      line.geometry.attributes.position.needsUpdate = true; // Ensure the update is rendered
    }
  }
}

// FINISH PREPPING THE RENDERER AND SOME CALLBACKS
scene.onBeforeRender = updateAllLines;

setupCheatsheet();
setupUI(state, executeCommand, renderer);

log(
  'Visit quaternions.maxwellrules.com/documentation for the full documentation'
);
