import * as THREE from 'three';
import * as monaco from 'monaco-editor';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { _help } from './help.js';
import { createFloatingPoint } from './components.js';
import { makeEarth } from './earth.js';
import {
  _rot,
  _angle,
  _frame,
  _mov,
  _mov2sat,
  _fetchTLE,
  find_best_quaternion_for_desired_attitude,
  _findBestQuaternion,
  _create_line,
  _add_point,
  _reset,
  addFrame,
} from './core.js';
import {
  getPositionOfPoint,
  validateName,
  xyz2geo,
  xyz2sph,
  geo2xyz,
  sph2xyz,
} from './utils.js';
import { logToOutput } from './logger.js';

function keepItAlive() {
  // This function prevents unused variable from being tree-shaken
  console.log(find_best_quaternion_for_desired_attitude);
  console.log(validateName);
  console.log(xyz2sph);
  console.log(xyz2geo);
  console.log(geo2xyz);
  console.log(sph2xyz);
}

keepItAlive();

// TODO: Do some more types
// TODO: Improve treeshaking situation
// TODO: Function to extra object from point and direction from line
// TODO: Better errors and use a Result type
// TODO: Check all functions receive everything they need as arguments
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Better names spec findBestQuaternion
// TODO: point_at based on findBestQuaternion that includes the rotation

const canvas = document.getElementById('webgl-canvas');
const executeButton = document.getElementById('execute');

let state = {
  points: {},
  lines: {},
  tles: {},
};

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
    // logToOutput(`> ${command}\n`);
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
    const { line, start, end, geometry } = state.lines[lineName];

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

function mov(point_name, pos, use_geo = false) {
  _mov(state, point_name, pos, use_geo);
}

function rot(point_name, q) {
  _rot(state, point_name, q);
}

function add_point(name, coordinates, quaternion = null) {
  _add_point(scene, state, name, coordinates, quaternion);
}

function list_points() {
  const pointNames = Object.keys(state.points);

  if (pointNames.length === 0) {
    logToOutput('No points currently exist in the state.');
  } else {
    logToOutput('Existing points:');
    pointNames.forEach((name) => logToOutput(`- ${name}`));
  }
}

function create_line(name, startArg, endArg) {
  _create_line(scene, state, name, startArg, endArg);
}

function angle(vec1, vec2) {
  return _angle(state, vec1, vec2);
}

function rad2deg(x) {
  return (x * 180) / Math.PI;
}

function deg2rad(x) {
  return (x * Math.PI) / 180;
}

async function fetchTLE(norad_id) {
  return _fetchTLE(state, norad_id);
}

async function mov2sat(name, cosparId, timestamp) {
  _mov2sat(state, name, cosparId, timestamp);
}

function findBestQuaternion(
  primaryBodyVector: [number, number, number] | string,
  secondaryBodyVector,
  primaryTargetVector,
  secondaryTargetVector,
): [number, number, number, number] {
  return _findBestQuaternion(
    state,
    primaryBodyVector,
    secondaryBodyVector,
    primaryTargetVector,
    secondaryTargetVector,
  );
}

function frame(point: string): {
  x: THREE.Vector3Tuple;
  y: THREE.Vector3Tuple;
  z: THREE.Vector3Tuple;
} {
  return _frame(state, point);
}

function help(commandName) {
  _help(commandName);
}

function reset() {
  _reset(scene, state);
}

// MAIN SETUP
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100000,
);
camera.position.set(14000, 2000, 2000);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, 1);

let earth_geometries = makeEarth();
scene.add(earth_geometries.earth);
scene.add(earth_geometries.earth_frame);

state.points['sat'] = createFloatingPoint();
addFrame(state.points['sat']);
scene.add(state.points['sat']);
_mov(state, 'sat', [39, 0, 500], true);
create_line('nadir', [0, 0, 0], 'sat');

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

scene.onBeforeRender = updateAllLines;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.minDistance = 8000;
controls.maxDistance = 20000;

function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false); // Resize the renderer without scaling the image
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Automatically resize canvas when the window resizes
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Call initially to ensure it fits on load

window.addEventListener('resize', () => {
  editor.layout(); // Ensure Monaco resizes properly on window resize
});

logToOutput(
  'Run `help()` or visit github.com/GCBallesteros/quaternions for more documentation',
);
