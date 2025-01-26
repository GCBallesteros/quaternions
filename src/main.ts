import { createAnimator, initScene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { updateTimeDisplay, setupUI } from './ui.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { log } from './logger.js';

// CURRENT
// TODO: Understand new code and refactor as necessary
// TODO: Add the camera or bring it from the state same for renderer
// TODO: Add Moon object
// TODO: Add Moon point for findBestQuaternion

// DOCUMENTATION EFFORTS
// TODO: Add images to documentation
// TODO: Add pretty star backdrop
// TODO: Add diagram to findBestQuaternion documentation
// TODO: What's on a TLE docs

// REFACTORING
// TODO: Improve name of createAnimator
// TODO: Better names spec findBestQuaternion computeOptimalQuaternion?
// TODO: Improve consistency on how we pass points around
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying

// EXTRA FEATURES
// TODO: validateName should make sure we don't use Sun or Moon
// TODO: Add Satellite class and have them fly around
// TODO: Transition smoothly between cameras
// TODO: Show coordinates over the Earth
// TODO: Buttont to bring back global camera
// TODO: Plots and tobs

const { scene, canvas, renderer } = initializeCanvas();
let state = initScene(scene, canvas, renderer);
let camera = state.cameras.main;
const switchCamera = createAnimator(renderer, scene, camera);

const commands = buildCommandClosures(scene, state, switchCamera);

let executeCommand = buildExecuteCommand(commands, state, switchCamera);

// Initialize time display
updateTimeDisplay(state);

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
        startPos.z,
      );
      line.geometry.attributes.position.setXYZ(1, endPos.x, endPos.y, endPos.z);
      line.geometry.attributes.position.needsUpdate = true; // Ensure the update is rendered
    }
  }
}

// FINISH PREPPING THE RENDERER AND SOME CALLBACKS
scene.onBeforeRender = updateAllLines;

log(
  'Visit quaternions.maxwellrules.com/documentation for the full documentation',
);

setupUI(state, executeCommand, renderer, camera);
