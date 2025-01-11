import * as monaco from 'monaco-editor';

import { initializeCanvas, init_scene } from './init.js';

import {
  getPositionOfPoint,
  validateName,
  xyz2geo,
  xyz2sph,
  geo2xyz,
  sph2xyz,
} from './utils.js';
import { logToOutput } from './logger.js';
import { buildCommandClosures } from './commands.js';

// TODO: Do some more types
// TODO: HTML won't resize
// TODO: All those js are annoying
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Better names spec findBestQuaternion
// TODO: point_at based on findBestQuaternion that includes the rotation

function _avoidTreeShaking() {
  console.log({
    getPositionOfPoint,
    validateName,
    xyz2geo,
    xyz2sph,
    geo2xyz,
    sph2xyz,
  });
}
_avoidTreeShaking();

let state = {
  points: {},
  lines: {},
  tles: {},
};

const { scene, canvas, renderer } = initializeCanvas();
let camera = init_scene(state, scene, canvas, renderer);

const commands = buildCommandClosures(scene, state);

const mov = commands.mov;
const rot = commands.rot;
const add_point = commands.add_point;
const create_line = commands.create_line;
const angle = commands.angle;
const rad2deg = commands.rad2deg;
const deg2rad = commands.deg2rad;
const fetchTLE = commands.fetchTLE;
const mov2sat = commands.mov2sat;
const findBestQuaternion = commands.findBestQuaternion;
const frame = commands.frame;
const help = commands.help;
const reset = commands.reset;

function list_points() {
  const pointNames = Object.keys(state.points);

  if (pointNames.length === 0) {
    logToOutput('No points currently exist in the state.');
  } else {
    logToOutput('Existing points:');
    pointNames.forEach((name) => logToOutput(`- ${name}`));
  }
}

// //////////
// TERMINAL
// //////////
const executeButton = document.getElementById('execute');

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

// Updated executeCommand to use Monaco's editor content
function executeCommand() {
  const command = editor.getValue().trim();
  console.log(command);
  if (command) {
    try {
      const result = eval(command); // Execute the code
      Promise.resolve(result)
        .then((resolvedValue) => {
          if (resolvedValue !== undefined) {
            logToOutput(`  ${resolvedValue}`);
          }
        })
        .catch((error) => {
          logToOutput(`Error: ${error.message}`);
        });
    } catch (error) {
      logToOutput(`Error: ${error.message}`);
    }
  }
}

// Attach the corrected event listener
executeButton.addEventListener('click', executeCommand);

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
resizeCanvas(); // Call initially to ensure it fits on load

logToOutput(
  'Run `help()` or visit github.com/GCBallesteros/quaternions for more documentation',
);
