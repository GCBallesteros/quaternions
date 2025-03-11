interface WorkflowExample {
  script: string;
  docLink: string;
}

const debugQuaternions = `let satellitePosition = [62.0, 34.0, 500.0];
mov("sat", satellitePosition, true);

let pointOfInterestCoords = geo2xyz([60.186, 24.828, 0]);
addPoint("KS", pointOfInterestCoords);

createLine("sat2KS", "sat", "KS");

let rotationQuaternion = [-0.6313439, -0.1346824, -0.6313439, -0.4297329];
rot("sat", rotationQuaternion);

let angle_between_pointing_and_target = angle(
     "sat2KS", point("sat").frame.z
);

log(angle_between_pointing_and_target);`;

const addSatellites = `reset(true);

// Set a specific date for consistent Moon position
let date = utcDate(2025, 1, 20, 9, 15, 0);
setTime(date);

// Add a satellite using its NORAD ID
await addSatellite(
  'hf1a', {
    type: 'noradId',
    noradId: '60562', // NORAD ID for the satellite
  }, {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.Nadir,
    secondaryTargetVector: NamedTargets.Velocity,
  }, {
    orientation: [0, Math.sin(Math.PI / 10), 0, Math.cos(Math.PI / 10)],
    fov: 20,
  }
);

// %%
createPlot(
  'sat1-orientation', {
    title: "Satellite Orientation",
    lines: ["qw", "qx", "qy", "qz"],
    sampleEvery: 20 // Sample every 10 frames
  },
  () => {
    const sat = point("hf1a");
    return sat.geometry.quaternion.toArray();
  }
);`;

const hotInHerre = `reset(true);

`;

const flyMeToTheMoon = `reset(true);

`;

export const defaultWorkflows: Record<string, WorkflowExample> = {
  'Spinning Around': {
    script: debugQuaternions,
    docLink: 'documentation/workflows/debugging-quaternions.html',
  },
  'Adding Satellites': {
    script: addSatellites,
    docLink: 'documentation/workflows/adding-satellites.html',
  },
  'Hot In Herre': {
    script: hotInHerre,
    docLink: 'documentation/workflows/adding-satellites.html',
  },
  'Fly Me To The Moon': {
    script: flyMeToTheMoon,
    docLink: 'documentation/workflows/adding-satellites.html',
  },
};
