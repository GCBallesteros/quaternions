import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { _help } from "./help.js";
import { createFloatingPoint } from "./components.js";
import { makeEarth } from "./earth.js";
import {
  _rot,
  _angle,
  _mov,
  find_best_quaternion_for_desired_attitude,
  _findBestQuaternion,
  _create_line,
  _add_point,
  addFrame,
} from "./core.js";
import {
  getPositionOfPoint,
  validateName,
  xyz2geo,
  xyz2sph,
  geo2xyz,
  sph2xyz,
} from "./utils.js";
import { logToOutput } from "./logger.js";

// TODO: mov2sat and fetchTLE
// TODO: Better errors
// TODO: Function to extra object from point and direction from line
// TODO: Check all functions receive everything they need as arguments
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Better names spec findBestQuaternion
// TODO: point_at based on findBestQuaternion that includes the rotation

const canvas = document.getElementById("webgl-canvas");
const executeButton = document.getElementById("execute");

let state = {
  points: {},
  lines: {},
  tles: {},
};


// Context object for additional state
const ctx = {};

// Initialize Monaco Editor
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs",
  },
});

let editor;

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: `// Write your commands here\nconsole.log('Hello, World!');`,
    language: "javascript",
    theme: "vs-dark",
  });
});

// Updated executeCommand to use Monaco's editor content
function executeCommand() {
  const command = editor.getValue().trim();
  console.log(command);
  if (command) {
    // logToOutput(`> ${command}\n`);
    try {
      const result = eval(command);  // Execute the code
      Promise.resolve(result).then((resolvedValue) => {
        if (resolvedValue !== undefined) {
          logToOutput(`  ${resolvedValue}`);
        }
      }).catch((error) => {
        logToOutput(`Error: ${error.message}`);
      });
    } catch (error) {
      logToOutput(`Error: ${error.message}`);
    }
  }
}

// Attach the corrected event listener
executeButton.addEventListener("click", executeCommand);

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
    logToOutput("No points currently exist in the state.");
  } else {
    logToOutput("Existing points:");
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


function findBestQuaternion(
  primaryBodyVector,
  secondaryBodyVector,
  primaryTargetVector,
  secondaryTargetVector,
) {
  return _findBestQuaternion(
    state,
    primaryBodyVector,
    secondaryBodyVector,
    primaryTargetVector,
    secondaryTargetVector,
  );
}

function frame(point) {
  // Ensure the point exists in the state
  if (!(point in state.points)) {
    console.error("Point not available in the state.");
    return null;
  }

  const pt = state.points[point];

  // Apply the quaternion to the standard basis vectors and return as arrays
  const basisVectors = {
    x: new THREE.Vector3(1, 0, 0).applyQuaternion(pt.quaternion).toArray(),
    y: new THREE.Vector3(0, 1, 0).applyQuaternion(pt.quaternion).toArray(),
    z: new THREE.Vector3(0, 0, 1).applyQuaternion(pt.quaternion).toArray(),
  };

  return basisVectors;
}

async function fetchTLE(norad_id) {
  // Check if TLE data already exists in the cache
  if (state.tles[norad_id]) {
    console.log("Using cached TLE for COSPAR ID:", norad_id);
    return state.tles[norad_id]; // Return cached TLE
  }

  // If not cached, fetch the TLE data from Celestrak
  const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${encodeURIComponent(norad_id)}&FORMAT=3LE`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.text();

  // Cache the fetched TLE in the state variable under the COSPAR ID
  state.tles[norad_id] = data;
  console.log("Fetched and cached TLE for COSPAR ID:", norad_id);

  return data;
}



async function mov2sat(name, cosparId, timestamp) {
  try {
    // Step 1: Fetch the TLE data using the COSPAR ID
    const tle = await fetchTLE(cosparId);

    // Step 2: Parse the TLE data using satellite.js
    const satrec = satellite.twoline2satrec(
      tle.split("\n")[1],
      tle.split("\n")[2],
    );

    // Step 3: Calculate the satellite's position at the given timestamp
    const positionAndVelocity = satellite.propagate(satrec, timestamp);
    const position = positionAndVelocity.position;

    if (!position) {
      logToOutput(
        `No position data found for satellite ${cosparId} at the given timestamp.`,
      );
      return;
    }

    // Step 4: Convert the position to Earth-centered (X, Y, Z) coordinates
    const gmst = satellite.gstime(timestamp);
    const { x, y, z } = satellite.eciToEcf(position, gmst);

    // Step 5: Update the position of the referenced point in the scene
    const point = state.points[name];
    if (point) {
      point.position.set(x, y, z);
      logToOutput(`Point ${name} moved to satellite position at ${timestamp}.`);
    } else {
      logToOutput(`Point with name '${name}' not found.`);
    }
  } catch (error) {
    logToOutput(
      `Error fetching or processing satellite data: ${error.message}`,
    );
  }
}


function help(commandName) {
  _help(commandName);
}


// MAIN SETUP
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100000
);
camera.position.set(14000, 2000, 2000);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, 1);

let earth_geometries = makeEarth();
scene.add(earth_geometries.earth);
scene.add(earth_geometries.earth_frame);

state.points["sat"] = createFloatingPoint();
addFrame(state.points["sat"]);
scene.add(state.points["sat"]);
_mov(state, "sat", [39, 0, 150], true);
create_line("nadir", [0, 0, 0], "sat");

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
    renderer.setSize(width, height, false);  // Resize the renderer without scaling the image
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// Automatically resize canvas when the window resizes
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Call initially to ensure it fits on load

window.addEventListener('resize', () => {
    editor.layout(); // Ensure Monaco resizes properly on window resize
});
