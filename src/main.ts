import * as monaco from 'monaco-editor';

import { createAnimator, init_scene, initializeCanvas } from './init.js';
import { buildExecuteCommand } from './terminal.js';
import { getPositionOfPoint } from './utils.js';

import { buildCommandClosures } from './commands.js';
import { log } from './logger.js';

import { State } from './types.js';

// TODO: Reset is not completely resetting the satellite
// TODO: Reset is not resetting the global camera
// TODO: Improve name of createAnimator
// TODO: Add camera2globalPOV
// TODO: Document new switchCamera function and global camera
// TODO: Add progressive rendering with a higher res progressive jpeg
// TODO: Improve consistency on how we pass points around
// TODO: Expose more options for object creation, widths, colors ...
// TODO: Normalize quats before applying
// TODO: Better names spec findBestQuaternion
// TODO: point_at based on findBestQuaternion that includes the rotation
// TODO: All the resolveVector like functions canCh be refactored (core.ts)

let state: State = {
  points: {},
  lines: {},
  tles: {},
};

const { scene, canvas, renderer } = initializeCanvas();
let camera = init_scene(state, scene, canvas, renderer);

const commands = buildCommandClosures(scene, state);

const switchCamera = createAnimator(renderer, scene, camera);

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
// // let good_quat = findBestQuaternion([0,0,-1], "y", "sat->KS", [0,0,1]);
// // rot("sat", good_quat);
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

log(
  'Run `help()` or visit github.com/GCBallesteros/quaternions for more documentation',
);
