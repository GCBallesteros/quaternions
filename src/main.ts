import { createAnimator, initScene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { updateTimeDisplay, setupUI } from './ui.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { log } from './logger.js';


// Before share
// TODO: Better names spec findBestQuaternion computeOptimalQuaternion?
// TODO: Make a workflow for Satellite. For example a constantly running nadir pointing sat
// TODO: Document Satellites
// TODO: Add Sun pointing mode. And update points
// TODO: Fix phase angle on bodies div
// TODO: Bodies div should show all the points
// TODO: Plus bottom div
// TODO: Make a Moon workflow
// TODO: Switch camera to null destroys everything

// REFACTORING
// TODO: Improve name of createAnimator
// TODO: Improve consistency on how we pass points around internally
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying

// EXTRA FEATURES
// TODO: Add diagram to findBestQuaternion documentation
// TODO: Transition smoothly between cameras
// TODO: Show coordinates over the Earth
// TODO: Buttont to bring back global camera
// TODO: Printing objects is terrible
// TODO: State visor
// TODO: Plots and tabs

const { scene, canvas, renderer } = initializeCanvas();
let state = initScene(scene, canvas, renderer);
let camera = state.cameras.main;
const switchCamera = createAnimator(renderer, scene, state, camera);

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

setupUI(state, executeCommand, renderer);
