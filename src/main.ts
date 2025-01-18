import * as monaco from 'monaco-editor';

import { createAnimator, initScene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { log } from './logger.js';

import { State } from './types.js';

// TODO: Reset is not resetting the global camera
// TODO: is addCamera doing the right thing I want it to point at +Z
//       add a quat wrt satellite
// TODO: Improve name of createAnimator
// TODO: Improve how we buildExecuteCommand
// TODO: Nice documentation
// TODO: Add camera2globalPOV
// TODO: Document new switchCamera function and global camera
// TODO: Add progressive rendering with a higher res progressive jpeg
// TODO: Improve consistency on how we pass points around
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Better names spec findBestQuaternion
// TODO: All the resolveVector like functions canCh be refactored (core.ts)
// TODO: Add Satellite class and have them fly around
// TODO: Transition smoothly between cameras
// TODO: Show coordinates over the Earth

let state: State = {
  points: {},
  lines: {},
  tles: {},
  cameras: {},
};

const { scene, canvas, renderer } = initializeCanvas();
initScene(state, scene, canvas, renderer);
let camera = state.cameras._main;
const switchCamera = createAnimator(renderer, scene, camera);

const commands = buildCommandClosures(scene, state, switchCamera);

let executeCommand = buildExecuteCommand(commands, state, switchCamera);

function list_points() {
  const pointNames = Object.keys(state.points);

  if (pointNames.length === 0) {
    log('No points currently exist in the state.');
  } else {
    log('Existing points:');
    pointNames.forEach((name) => log(`- ${name}`));
  }
}

const satelliteScript = `// Reset scene so that we can hit execute repeatedly
// on this sample script without errors
reset();
// Move the default point, 'sat', to somewhere somewhat near Helsinki
mov("sat", [62.0, 34.0, 500.0], true);
// Calculate ECEF coordinates of point of interest and store them
let ksCoords = geo2xyz([60.186, 24.828, 0]);
// Add a point over the previously calculated coords
add_point("KS", ksCoords);
// Connect "sat" to new point
create_line("sat2KS", "sat", "KS");
// Rotate 'sat' to some buggy quaternion
rot("sat", [-0.6313439, -0.1346824, -0.6313439, -0.4297329]);
// Calculate angle between z-axis of 'sat' and 'sat2KS'
angle("sat2KS", point("sat").frame.z);

// Uncomment the code below to fix the orientation of the satellite
// and watch the scene from its point of view.
// // Lets calculate the correct quaternion to point at KS now
// let good_quat = findBestQuaternion([0,0,-1], "y", "sat->KS", [0,0,1]);
// rot("sat", good_quat);
// // Add a camera wit a FOV of 50 degrees and switch to the satellite camera
// point("sat").addCamera(50);
// switchCamera(point("sat").camera);
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
  'Run `help()` or visit github.com/GCBallesteros/quaternions for more documentation',
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
