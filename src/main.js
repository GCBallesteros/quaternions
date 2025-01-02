import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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

// TODO: Check all functions receive everything they need as arguments
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Better names spec findBestQuaternion
// TODO: Function to extra object from point and direction from line
// TODO: point_at based on findBestQuaternion that includes the rotation

const canvas = document.getElementById("webgl-canvas");
const commandInput = document.getElementById("command");
const executeButton = document.getElementById("execute");

let state = {
  points: {},
  lines: {},
  tles: {},
};

const commands = {};

const RADIUS_EARTH = 6371.0;

const ctx = {};

function executeCommand() {
  const command = commandInput.value.trim();
  if (command) {
    logToOutput(`> ${command}\n`);
    try {
      const result = eval(command);
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
    commandInput.value = "";
  }
}

executeButton.addEventListener("click", executeCommand);
commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    executeCommand();
    event.preventDefault(); // Prevent default behavior (e.g., form submission)
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function mov(point_name, pos, use_geo = false) {
  _mov(state, point_name, pos, use_geo);
}

mov.help = {
  description:
    "Moves a named point to a specific latitude, longitude, and altitude.",
  arguments: [
    {
      name: "point_name",
      type: "string",
      description: "The name of the point to move.",
    },
    { name: "pos", type: "array", description: "Position." },
    {
      name: "use_geo",
      type: "bool",
      description: "Use geographical or cartesian coordinates.",
    },
  ],
};
commands.mov = mov;

function rot(point_name, q) {
  _rot(state, point_name, q);
}

rot.help = {
  description:
    "Rotates a point to match the orientation implied by the quaternion.",
  arguments: [
    {
      name: "point_name",
      type: "string",
      description: "The name of the point to rotate.",
    },
    {
      name: "q",
      type: "array",
      description: "A quaternion `[x, y, z, w]` for the rotation.",
    },
  ],
};
commands.rot = rot;

function add_point(name, coordinates, quaternion = null) {
  _add_point(scene, state, name, coordinates, quaternion);
}

add_point.help = {
  description: "Adds a new point to the scene.",
  arguments: [
    { name: "name", type: "string", description: "Name of the point." },
    {
      name: "coordinates",
      type: "array",
      description: "Cartesian coordinates `[x, y, z]`.",
    },
    {
      name: "quaternion",
      type: "array (optional)",
      description: "Initial rotation as a quaternion `[x, y, z, w]`.",
    },
  ],
};
commands.add_point = add_point;

function list_points() {
  const pointNames = Object.keys(state.points);

  if (pointNames.length === 0) {
    logToOutput("No points currently exist in the state.");
  } else {
    logToOutput("Existing points:");
    pointNames.forEach((name) => logToOutput(`- ${name}`));
  }
}

list_points.help = {
  description: "Lists all points currently in the state.",
  arguments: [],
};
commands.list_points = list_points;

function create_line(name, startArg, endArg) {
  _create_line(scene, state, name, startArg, endArg);
}

create_line.help = {
  description: "Creates a line between two points or coordinates.",
  arguments: [
    { name: "name", type: "string", description: "Name of the line." },
    {
      name: "startArg",
      type: "array or string",
      description: "Starting point or coordinates.",
    },
    {
      name: "endArg",
      type: "array or string",
      description: "Ending point or coordinates.",
    },
  ],
};
commands.create_line = create_line;

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

function angle(vec1, vec2) {
  return _angle(state, vec1, vec2);
}

angle.help = {
  description: "Calculates the angle between two vectors.",
  arguments: [
    {
      name: "vec1Arg",
      type: "string/array",
      description: "A vector or 'point1->point2' string.",
    },
    {
      name: "vec2Arg",
      type: "string/array",
      description: "A vector or 'point1->point2' string.",
    },
  ],
};
commands.angle = angle;

function rad2deg(x) {
  return (x * 180) / Math.PI;
}

rad2deg.help = {
  description: "Converts radians to degrees.",
  arguments: [{ name: "x", type: "number", description: "Angle in radians." }],
};
commands.rad2deg = rad2deg;

function deg2rad(x) {
  return (x * Math.PI) / 180;
}

deg2rad.help = {
  description: "Converts degrees to radians.",
  arguments: [{ name: "x", type: "number", description: "Angle in degrees." }],
};
commands.deg2rad = deg2rad;

commands.xyz2sph = xyz2sph;
commands.sph2xyz = sph2xyz;
commands.geo2xyz = geo2xyz;
commands.xyz2geo = xyz2geo;

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

findBestQuaternion.help = {
  description:
    "A wrapper around the `find_best_quaternion_for_desired_attitude` function that simplifies the process of aligning body vectors to target vectors by supporting flexible inputs.",
  arguments: [
    {
      name: "primaryVecArg",
      type: "array | string",
      description:
        "The primary body vector. Can be a 3-element array (e.g., [1, 0, 0]) or one of `x`, `y`, or `z`.",
    },
    {
      name: "secondaryVecArg",
      type: "array | string",
      description:
        "The secondary body vector. Can be a 3-element array (e.g., [0, 1, 0]) or one of `x`, `y`, or `z`.",
    },
    {
      name: "primaryTargetArg",
      type: "array | string",
      description:
        "The target vector for the primary body vector. Can be a 3-element array, a line name, or a string in the form `startPoint->endPoint`.",
    },
    {
      name: "secondaryTargetArg",
      type: "array | string",
      description:
        "The target vector for the secondary body vector. Can be a 3-element array, a line name, or a string in the form `startPoint->endPoint`",
    },
  ],
};
commands.findBestQuaternion = findBestQuaternion;

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

frame.help = {
  description: "Returns the local frame vectors of a point.",
  arguments: [
    { name: "point", type: "string", description: "The name of the point." },
  ],
};
commands.frame = frame;

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

fetchTLE.help = {
  description:
    "Fetches the Two-Line Element (TLE) for a satellite using its COSPAR ID.",
  arguments: [
    {
      name: "norad_id",
      type: "string",
      description: "COSPAR ID of the satellite.",
    },
  ],
};
commands.fetchTLE = fetchTLE;

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

mov2sat.help = {
  description:
    "Moves a point to the position of a satellite at a given timestamp.",
  arguments: [
    {
      name: "name",
      type: "string",
      description: "The name of the point to move.",
    },
    {
      name: "cosparId",
      type: "string",
      description: "COSPAR ID of the satellite.",
    },
    {
      name: "timestamp",
      type: "Date",
      description: "The time for which the position is computed.",
    },
  ],
};
commands.mov2sat = mov2sat;

function help(commandName) {
  if (!commandName) {
    logToOutput(
      "For full docs visit: https://github.com/GCBallesteros/quaternions",
    );
    logToOutput("Available commands:");
    Object.keys(commands).forEach((cmd) => {
      logToOutput(`- ${cmd}`);
    });
    return;
  }

  const command = commands[commandName];
  if (!command || !command.help) {
    logToOutput(`Command '${commandName}' not found.`);
    return;
  }

  logToOutput(`**${commandName}**`);
  logToOutput(command.help.description);
  logToOutput("Arguments:");
  command.help.arguments.forEach((arg) => {
    logToOutput(`- ${arg.name} (${arg.type}): ${arg.description}`);
  });
}

// MAIN
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100000,
); // Adjusted far plane for Earth's scale
camera.position.set(14000, 2000, 2000);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, 1);

// Load Earth texture
let earth_geometries = makeEarth();
scene.add(earth_geometries.earth);
scene.add(earth_geometries.earth_frame);

state.points["sat"] = createFloatingPoint();
addFrame(state.points["sat"]);
scene.add(state.points["sat"]);
mov("sat", [39, 0, 150], true);

animate();

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.minDistance = 8000;
controls.maxDistance = 20000;

// Adjust the canvas on resize
window.addEventListener("resize", () => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
});

// Hook into the render loop
scene.onBeforeRender = updateAllLines;

create_line("nadir", [0, 0, 0], "sat");
