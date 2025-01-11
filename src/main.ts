import * as monaco from 'monaco-editor';

import { init_scene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { logToOutput } from './logger.js';

// TODO: Do some more types
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Better names spec findBestQuaternion
// TODO: point_at based on findBestQuaternion that includes the rotation

let state = {
  points: {},
  lines: {},
  tles: {},
};

const { scene, canvas, renderer } = initializeCanvas();
let camera = init_scene(state, scene, canvas, renderer);

const commands = buildCommandClosures(scene, state);

let executeCommand = buildExecuteCommand(commands);

function list_points() {
  const pointNames = Object.keys(state.points);

  if (pointNames.length === 0) {
    logToOutput('No points currently exist in the state.');
  } else {
    logToOutput('Existing points:');
    pointNames.forEach((name) => logToOutput(`- ${name}`));
  }
}

// Context object for additional state
const ctx = {};

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
angle("sat2KS", frame("sat").z);
`;

const editor = monaco.editor.create(
  document.getElementById('monaco-editor') as HTMLElement,
  {
    value: satelliteScript,
    language: 'javascript',
    theme: 'vs-dark',
  },
);

const executeButton = document.getElementById('execute');
executeButton.addEventListener('click', () => {
  executeCommand(editor.getValue().trim());
});

// Update all lines in the registry before each render
function updateAllLines() {
  for (const lineName in state.lines) {
    const { _, start, end, geometry } = state.lines[lineName];

    const startPos = getPositionOfPoint(state, start);
    const endPos = getPositionOfPoint(state, end);

    if (startPos && endPos) {
      // Update the line geometry's positions
      geometry.attributes.position.setXYZ(
        0,
        startPos.x,
        startPos.y,
        startPos.z,
      );
      geometry.attributes.position.setXYZ(1, endPos.x, endPos.y, endPos.z);
      geometry.attributes.position.needsUpdate = true; // Ensure the update is rendered
    }
  }
}

// FINISH PREPPING THE RENDERER AND SOME CALLBACKS
scene.onBeforeRender = updateAllLines;

function resizeCanvas() {
  const width = window.innerWidth * 0.66; // Assuming flex ratio
  const height = window.innerHeight;
  renderer.setSize(width, height, true);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  editor.layout(); // Ensure Monaco resizes properly on window resize
}

//function resizeCanvas() {
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

logToOutput(
  'Run `help()` or visit github.com/GCBallesteros/quaternions for more documentation',
);
