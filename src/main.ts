import * as monaco from 'monaco-editor';

import { createAnimator, initScene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { log } from './logger.js';

import { State } from './types.js';

// DOCUMENTATION EFFORTS
// TODO: Add images to documentation
// TODO: Add pretty star backdrop

// REFACTORING
// TODO: Improve name of createAnimator
// TODO: Improve how we buildExecuteCommand
// TODO: Better names spec findBestQuaternion computeOptimalQuaternion?
// TODO: Improve consistency on how we pass points around
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: All the resolveVector like functions canCh be refactored (core.ts)

// EXTRA FEATURES
// TODO: Add setSimTime and add Moon object
// TODO: Add Satellite class and have them fly around
// TODO: Transition smoothly between cameras
// TODO: Show coordinates over the Earth
// TODO: Buttont to bring back global camera
// TODO: Plots and tobs

let state: State = {
  points: {},
  lines: {},
  tles: {},
  cameras: {},
};

const { scene, canvas, renderer } = initializeCanvas();
initScene(state, scene, canvas, renderer);
let camera = state.cameras.main;
const switchCamera = createAnimator(renderer, scene, camera);

const commands = buildCommandClosures(scene, state, switchCamera);

let executeCommand = buildExecuteCommand(commands, state, switchCamera);

const satelliteScript = `// Reset scene so that we can hit execute repeatedly
// on this sample script without errors
reset();

// Simulation params
const target_coords_ecef = geo2xyz([60.186, 24.828, 0]);
const satellite_location_geo = [62.0, 34.0, 500.0];
// quaternions are in xyzw order
const satellite_bad_quat = [
    -0.6313439,
    -0.1346824,
    -0.6313439,
    -0.4297329
];

// Move the default point, 'sat', to somewhere somewhat near Helsinki
mov("sat", satellite_location_geo, true);
// Add a point over the previously calculated coords
add_point("KS", target_coords_ecef);
// Connect "sat" to new point
create_line("sat2KS", "sat", "KS");
// Rotate 'sat' to buggy quaternion
rot("sat", satellite_bad_quat);
// Calculate angle between z-axis of 'sat' and 'sat2KS'
let angle_between_pointing_and_target = angle(
     "sat2KS", point("sat").frame.z
);
log(angle_between_pointing_and_target);

// Uncomment the code below to fix the orientation of the satellite
// and watch the scene from its point of view.

// // Add a camera wit a FOV of 50 degrees and switch to the satellite camera
// point("sat").addCamera(50);
// switchCamera(point("sat").camera);
// // Point camera at the target
// let good_quat = findBestQuaternion(
//     point("sat").cameraBodyDirection,
//     "y",
//     "sat->KS",
//     [0,0,1]
// );
// rot("sat", good_quat);
`;

const editor = monaco.editor.create(
  document.getElementById('monaco-editor') as HTMLElement,
  {
    value: satelliteScript,
    language: 'javascript',
    theme: 'vs-dark',
    minimap: { enabled: false },
  },
);

const executeButton = document.getElementById('execute')!;
executeButton.addEventListener('click', () => {
  executeCommand(editor.getValue().trim());
});

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

function resizeCanvas(): void {
  const canvasWidth = canvasContainer.clientWidth;
  const canvasHeight = window.innerHeight;
  renderer.setSize(canvasWidth, canvasHeight, true);
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();

  // Adjust Monaco Editor size
  editor.layout({
    width: editorContainer.clientWidth,
    height: editorContainer.clientHeight,
  });
}

//function resizeCanvas() {
window.addEventListener('resize', resizeCanvas);

log(
  'Visit github.com/GCBallesteros/quaternions/documentation for the full documentation',
);

const resizer = document.getElementById('resizer')!;
const canvasContainer = document.getElementById('canvas-container')!;
const editorContainer = document.getElementById('editor-container')!;

resizer.addEventListener('mousedown', (event) => {
  event.preventDefault();
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', onMouseMove);
  });
});

function onMouseMove(event: MouseEvent) {
  const totalWidth = window.innerWidth;
  const leftWidth = event.clientX;
  canvasContainer.style.width = `${leftWidth}px`;
  editorContainer.style.width = `${totalWidth - leftWidth - resizer.clientWidth}px`;
  resizeCanvas(); // Call your resizing logic live as you drag
}
resizeCanvas();
