import { createAnimator, initScene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { updateTimeDisplay, setupUI } from './ui.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { log } from './logger.js';

// Before share
// TODO: Trails: Fix scene passig mess
// TODO: Trails: Sync sat color with trail color
// TODO: Trails: Broken if not nadir pointing
// TODO: Trails: Make trail disappear when deleting satellites and resetting
// TODO: Trails: Toggles for trail. Toggle untoggle destroys the trail or even better only if time flows
// TODO: Trails: Should use camera orientation instead of doing weird assumpions
// TODO: Trails: Docs
// TODO: Time: Fix time use always UTC everywhere and run tests
// TODO: Time: Docs explain this
// TODO: Add POV Window
// TODO: Add plots with callbacks
// TODO: Add docs for the UI
// TODO: Better names spec findBestQuaternion computeOptimalQuaternion?
// TODO: Add offset quaternion
// TODO: Moon should be correctly oriented
// TODO: Add diagram to findBestQuaternion documentation

// REFACTORING
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying

// EXTRA FEATURES
// TODO: Button to bring back global camera
// TODO: Printing objects is terrible
// TODO: Make a learning track
// TODO: Transition smoothly between cameras (maybe)
// TODO: Show coordinates over the Earth
// TODO: POV: Higher resolution textures

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
