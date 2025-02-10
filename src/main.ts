import { createAnimator, initScene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { updateTimeDisplay, setupUI } from './ui.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { log } from './logger.js';

// Before share
// TONIGHT
// TODO: Trails: Scripted version
// TODO: Trails: Docs
// TODO: Docs all around We now have cameraConfigs
// TODO: Time: Docs explain utcDate and everything is utc
// TODO: Offset: Document new offset option and setter with example retrieving point
// TODO: Docs: relativeRot
// TODO: Docs: By convention the trail is along rows
// TODO: Distance function

// TODO: Add POV Window
// TODO: Add plots with callbacks
// TODO: Add docs for the UI
// TODO: Better names spec findBestQuaternion computeOptimalQuaternion?
// TODO: Moon should be correctly oriented
// TODO: Add diagram to findBestQuaternion documentation

// REFACTORING
// TODO: Get rid of pos and rot functions
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Migrate to React
// TODO: Normalize quats before applying

// EXTRA FEATURES
// TODO: Cameras so we don't have to go to state
// TODO: Load workflows button
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
