import * as THREE from 'three';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

import { createFrame, createFloatingPoint ,createLineGeometry} from './components.js';
import { makeEarth } from './earth.js'
import {_rot} from './core.js'

// TODO: Intercept command
// TODO: Check all functions receive everything they need as arguments
// TODO: Cleanup: commands.js
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Help command

// Get the canvas element
const canvas = document.getElementById('webgl-canvas');
const output = document.getElementById('output');
const commandInput = document.getElementById('command');
const executeButton = document.getElementById('execute');

let state = {
    points: {},
    lines: {},
    tles: {}
};

const RADIUS_EARTH = 6371.0;

function validateName(name, state) {
    const namePattern = /^[a-zA-Z0-9_-]+$/; // Alphanumeric, underscores, and dashes

    if (!namePattern.test(name)) {
        logToOutput(`Error: Name '${name}' must be alphanumeric and may contain underscores (_) or dashes (-).`);
        return false;
    }

    if (state.points[name] || state.lines[name]) {
        logToOutput(`Error: Name '${name}' is already in use.`);
        return false;
    }

    return true;
}


function addFrame(point) {
    point.add(createFrame(point.position, 400))
}

function updatePointPosition(point, latitude, longitude, altitude) {
    const radius = RADIUS_EARTH + altitude;
    const phi_ = THREE.MathUtils.degToRad(90 - latitude);
    const theta_ = THREE.MathUtils.degToRad(longitude);

    point.position.x = radius * Math.sin(phi_) * Math.cos(theta_);
    point.position.y = radius * Math.sin(phi_) * Math.sin(theta_);
    point.position.z = radius * Math.cos(phi_);
}



const ctx={};

function executeCommand() {
    const command = commandInput.value.trim();
    if (command) {
        logToOutput(`> ${command}\n`); // Log the entered command
        try {
            const result = eval(command); // Evaluate the command
            Promise.resolve(result) // Handle both promises and regular values
                .then(resolvedValue => {
                    if (resolvedValue !== undefined) {
                        logToOutput(`  ${resolvedValue}`);
                    }
                })
                .catch(error => {
                    logToOutput(`Error: ${error.message}`);
                });
        } catch (error) {
            logToOutput(`Error: ${error.message}`);
        }
        commandInput.value = ''; // Clear the input field
    }
}

function logToOutput(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    output.appendChild(messageElement);
    output.scrollTop = output.scrollHeight; // Scroll to the bottom
}

// Add event listener for the button click
executeButton.addEventListener('click', executeCommand);

// Add event listener for pressing Enter key
commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        executeCommand();
        event.preventDefault(); // Prevent default behavior (e.g., form submission)
    }
});


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


// TODO: should receive xyz or lat/long/alt and have a flag to decide
function mov(point_name, lat, long, alt) {
    updatePointPosition(state.points[point_name], lat, long, alt);
}



function rot(point_name, q) {
   _rot(state, point_name, q);
}


function add_point(name, coordinates, quaternion = null) {
    if (!validateName(name, state)) {
        return;
    }
    if (!name || !coordinates || coordinates.length !== 3) {
        console.error(
            "Invalid arguments: 'name' must be a string and 'coordinates' must be an array of 3 numbers."
            );
        return;
    }

    const pointGroup = createFloatingPoint();
    pointGroup.position.set(coordinates[0], coordinates[1], coordinates[2]);

    if (quaternion && quaternion.length === 4) {
        addFrame(pointGroup);
        const q = new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[
            2], quaternion[3]); // wxyz
        pointGroup.setRotationFromQuaternion(q);
    }

    state.points[name] = pointGroup;
    scene.add(pointGroup);
}

function list_points() {
    const pointNames = Object.keys(state.points);

    if (pointNames.length === 0) {
        logToOutput("No points currently exist in the state.");
    } else {
        logToOutput("Existing points:");
        pointNames.forEach(name => logToOutput(`- ${name}`));
    }
}



// Function to get the position of a point, either by name or coordinates
function getPositionOfPoint(pointArg) {
    if (Array.isArray(pointArg) && pointArg.length === 3) {
        return new THREE.Vector3(pointArg[0], pointArg[1], pointArg[2]);
    } else if (typeof pointArg === 'string' && state.points[pointArg]) {
        return state.points[pointArg].position;
    } else {
        console.error(
            "Invalid point argument. Expected an array of 3 elements or a point name."
            );
        return null;
    }
}

// Function to create the line geometry between two points

// Function to create a line between two points and add it to the state
function create_line(name, startArg, endArg) {
    if (!validateName(name, state)) {
        return; // Exit if name validation fails
    }

    if (!name || typeof name !== 'string') {
        console.error("Invalid line name. It must be a non-empty string.");
        return;
    }

    const startPos = getPositionOfPoint(startArg);
    const endPos = getPositionOfPoint(endArg);

    if (!startPos || !endPos) {
        console.error("Invalid points passed to create_line.");
        return;
    }

    // Create the line geometry
    const geometry = createLineGeometry(startPos, endPos);

    // Create the line material
    const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

    // Create the line and add it to the scene
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Store the line in the state registry
    state.lines[name] = {
        line,
        start: startArg,
        end: endArg,
        geometry,
    };
}

// Update all lines in the registry before each render
function updateAllLines() {
    for (const lineName in state.lines) {
        const {
            line,
            start,
            end,
            geometry
        } = state.lines[lineName];

        const startPos = getPositionOfPoint(start);
        const endPos = getPositionOfPoint(end);

        if (startPos && endPos) {
            // Update the line geometry's positions
            geometry.attributes.position.setXYZ(0, startPos.x, startPos.y,
                startPos.z);
            geometry.attributes.position.setXYZ(1, endPos.x, endPos.y, endPos
            .z);
            geometry.attributes.position.needsUpdate =
            true; // Ensure the update is rendered
        }
    }
}



function angle(vec1Arg, vec2Arg) {
    // Helper function to resolve a vector from its argument
    function resolveVector(arg) {
        if (Array.isArray(arg) && arg.length === 3) {
            // Literal vector
            return new THREE.Vector3(arg[0], arg[1], arg[2]);
        } else if (typeof arg === 'string') {
            if (arg.includes('->')) {
                // Vector in the form "<start_point_name>-><end_point_name>"
                const [startName, endName] = arg.split('->').map(name => name
                    .trim());
                const startPos = getPositionOfPoint(startName);
                const endPos = getPositionOfPoint(endName);

                if (!startPos || !endPos) {
                    console.error(
                        `Invalid points in vector definition '${arg}'.`);
                    return null;
                }

                return endPos.clone().sub(startPos); // Compute vector
            } else if (state.lines[arg]) {
                // Argument is a line name
                const line = state.lines[arg];
                const startPos = getPositionOfPoint(line.start);
                const endPos = getPositionOfPoint(line.end);

                if (!startPos || !endPos) {
                    console.error(`Invalid line '${arg}' in state.lines.`);
                    return null;
                }

                return endPos.clone().sub(startPos); // Compute vector
            } else {
                console.error(`Invalid string argument '${arg}'.`);
                return null;
            }
        } else {
            console.error(
                "Argument must be an array of 3 values or a valid string.");
            return null;
        }
    }

    // Resolve both vectors
    const vec1 = resolveVector(vec1Arg);
    const vec2 = resolveVector(vec2Arg);

    if (!vec1 || !vec2) {
        return null; // If either vector is invalid, return null
    }

    // Calculate the angle
    const dotProduct = vec1.dot(vec2);
    const magnitudeProduct = vec1.length() * vec2.length();

    if (magnitudeProduct === 0) {
        console.error("Cannot calculate angle with zero-length vector.");
        return null;
    }

    const cosineAngle = THREE.MathUtils.clamp(dotProduct / magnitudeProduct, -1,
        1); // Clamp to avoid numerical errors
    const angleRadians = Math.acos(cosineAngle);

    // Convert radians to degrees
    return THREE.MathUtils.radToDeg(angleRadians);
}

function rad2deg(x) {
  return x * 180 / Math.PI
}

function deg2rad(x) {
  return x *  Math.PI / 180
}

/**
 * Converts Cartesian coordinates (x, y, z) to spherical coordinates.
 * 
 * @param {Array<number>} point - An array of three numbers representing a point in 3D Cartesian space [x, y, z].
 * @returns {Array<number>} An array [latitude, longitude, radius], where:
 *  - latitude (degrees): Angle from the equatorial plane, ranges from -90 to 90.
 *  - longitude (degrees): Angle in the xy-plane from the positive x-axis, ranges from -180 to 180.
 *  - radius: The distance from the origin to the point.
 * @throws {Error} If the input is invalid or the radius is zero.
 */
function xyz2sph(point) {
    if (!Array.isArray(point) || point.length !== 3) {
        throw new Error("Input must be an array with three numerical values [x, y, z].");
    }

    const [x, y, z] = point;

    const radius = Math.sqrt(x * x + y * y + z * z);
    if (radius === 0) {
        throw new Error("Radius cannot be zero.");
    }

    const latitude = 90 - THREE.MathUtils.radToDeg(Math.acos(z / radius));
    const longitude = THREE.MathUtils.radToDeg(Math.atan2(y, x));

    return [latitude, longitude, radius];
}


/**
 * Converts spherical coordinates (latitude, longitude, radius) to Cartesian coordinates (x, y, z).
 * 
 * @param {Array<number>} sph - An array of three numbers [latitude, longitude, radius], where:
 *  - latitude (degrees): Angle from the equatorial plane, ranges from -90 to 90.
 *  - longitude (degrees): Angle in the xy-plane from the positive x-axis, ranges from -180 to 180.
 *  - radius: The distance from the origin.
 * @returns {Array<number>} An array [x, y, z] representing the Cartesian coordinates.
 * @throws {Error} If the input is invalid.
 */
function sph2xyz(sph) {
    if (!Array.isArray(sph) || sph.length !== 3) {
        throw new Error("Input must be an array with three numerical values [latitude, longitude, radius].");
    }

    const [latitude, longitude, radius] = sph;

    const latRad = THREE.MathUtils.degToRad(latitude);
    const lonRad = THREE.MathUtils.degToRad(longitude);

    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.cos(latRad) * Math.sin(lonRad);
    const z = radius * Math.sin(latRad);

    return [x, y, z];
}

function geo2xyz(geo) {
    const [latitude, longitude, altitude] = geo;
    return  sph2xyz([latitude,longitude,altitude + RADIUS_EARTH]);
}

function xyz2geo(xyz) {
    const [latitude, longitude, radius] = xyz2sph(xyz);
    return [latitude, longitude, radius - RADIUS_EARTH];
}

function frame(point) {
  if (point in state.points === false) {
    console.log("Not available");
    return;
  }
  const pt = state.points[point];

  // TODO: Loop over each of this vectors and deconstruct them into just an array of values
  return {
    x:new THREE.Vector3(1,0,0).applyQuaternion(pt.quaternion),
    y:new THREE.Vector3(0,1,0).applyQuaternion(pt.quaternion),
    z:new THREE.Vector3(0,0,1).applyQuaternion(pt.quaternion)
  };
}



async function fetchTLE(norad_id) {
    // Check if TLE data already exists in the cache
    if (state.tles[norad_id]) {
        console.log('Using cached TLE for COSPAR ID:', norad_id);
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
    console.log('Fetched and cached TLE for COSPAR ID:', norad_id);

    return data;
}



async function mov2sat(name, cosparId, timestamp) {
    try {
        // Step 1: Fetch the TLE data using the COSPAR ID
        const tle = await fetchTLE(cosparId);
				console.log(tle);

        // Step 2: Parse the TLE data using satellite.js
        const satrec = satellite.twoline2satrec(tle.split('\n')[1], tle.split('\n')[2]);
        console.log(satrec);			
				console.log(timestamp);

        // Step 3: Calculate the satellite's position at the given timestamp
        const positionAndVelocity = satellite.propagate(satrec, timestamp);
        const position = positionAndVelocity.position;

        if (!position) {
            logToOutput(`No position data found for satellite ${cosparId} at the given timestamp.`);
            return;
        }
        console.log(position);			

        // Step 4: Convert the position to Earth-centered (X, Y, Z) coordinates
        // The position comes in meters, convert to kilometers (or appropriate scale for your scene)
        const x = position.x;
        const y = position.y;
        const z = position.z;

        // Step 5: Update the position of the referenced point in the scene
        const point = state.points[name];
        if (point) {
            point.position.set(x, y, z);
            logToOutput(`Point ${name} moved to satellite position at ${timestamp}.`);
        } else {
            logToOutput(`Point with name '${name}' not found.`);
        }
    } catch (error) {
        logToOutput(`Error fetching or processing satellite data: ${error.message}`);
    }
}


// MAIN
const renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas
    .clientHeight, 0.1, 100000); // Adjusted far plane for Earth's scale
camera.position.set(14000, 2000, 2000);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, 1);


// Load Earth texture
let earth_geometries = makeEarth()
scene.add(earth_geometries.earth);
scene.add(earth_geometries.earth_frame);

state.points["sat"] = createFloatingPoint();
addFrame(state.points["sat"]);
scene.add(state.points["sat"]);
updatePointPosition(state.points.sat, 39, 0, 150);

animate();

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.minDistance = 8000;
controls.maxDistance = 20000;

// Adjust the canvas on resize
window.addEventListener('resize', () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
});

// Hook into the render loop
scene.onBeforeRender = updateAllLines;

create_line("nadir", [0,0,0],"sat")

