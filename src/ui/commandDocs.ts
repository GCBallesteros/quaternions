/**
 * Documentation for commands used in the editor
 * This provides rich descriptions and parameter information for intellisense
 */

export interface ParameterDoc {
  name: string;
  description: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

export interface CommandDoc {
  description: string;
  parameters: ParameterDoc[];
  returns?: {
    type: string;
    description: string;
  };
  example?: string;
  documentationUrl?: string;
}

export const commandDocs: Record<string, CommandDoc> = {
  mov: {
    description: 'Moves a point to a new position in 3D space.',
    parameters: [
      {
        name: 'point_name',
        description: 'Name of the point to move',
        type: 'string',
        optional: false,
      },
      {
        name: 'pos',
        description: 'New position as [x, y, z] array or Vector3',
        type: 'Array3 | Vector3',
        optional: false,
      },
      {
        name: 'use_geo',
        description:
          'If true, interprets coordinates as [latitude, longitude, altitude]',
        type: 'boolean',
        optional: true,
        defaultValue: 'false',
      },
    ],
    example:
      'mov("sat", [1000, 2000, 3000]);\n// With geographic coordinates:\nmov("sat", [45.0, -75.0, 500], true);',
    documentationUrl: 'quaternions.maxwellrules.com/documentation',
  },

  rot: {
    description: 'Rotates a point using a quaternion.',
    parameters: [
      {
        name: 'point_name',
        description: 'Name of the point to rotate',
        type: 'string',
        optional: false,
      },
      {
        name: 'q',
        description: 'Quaternion as [x, y, z, w] array',
        type: 'Vector4',
        optional: false,
      },
    ],
    example: 'rot("sat", [0, 0, 0, 1]); // Identity quaternion',
    documentationUrl: undefined,
  },

  addPoint: {
    description: 'Adds a new point to the scene.',
    parameters: [
      {
        name: 'name',
        description: 'Unique name for the new point',
        type: 'string',
        optional: false,
      },
      {
        name: 'coordinates',
        description: 'Position as [x, y, z] array or Vector3',
        type: 'Array3 | Vector3',
        optional: false,
      },
      {
        name: 'quaternion',
        description: 'Optional orientation as [x, y, z, w] array',
        type: 'Vector4 | null',
        optional: true,
        defaultValue: 'null',
      },
      {
        name: 'color',
        description: 'Color in hex format',
        type: 'string',
        optional: true,
        defaultValue: "'#ffffff'",
      },
    ],
    example: 'addPoint("target", [6378137, 0, 0], null, "#ff0000");',
  },

  addSatellite: {
    description: 'Adds a satellite to the scene using TLE data.',
    parameters: [
      {
        name: 'name',
        description: 'Unique name for the satellite',
        type: 'string',
        optional: false,
      },
      {
        name: 'tleSource',
        description: 'TLE data source object',
        type: 'TleSource',
        optional: false,
      },
      {
        name: 'orientationMode',
        description: 'How the satellite should be oriented',
        type: 'OrientationMode',
        optional: false,
      },
      {
        name: 'cameraConfig',
        description: 'Optional camera configuration',
        type: 'object',
        optional: true,
      },
    ],
    example:
      'addSatellite("ISS", { type: "tle", tle: "1 25544U..." }, { type: "fixed", ecef_quaternion: [0, 0, 0, 1] });',
  },

  createLine: {
    description: 'Creates a line between two points.',
    parameters: [
      {
        name: 'name',
        description: 'Unique name for the line',
        type: 'string',
        optional: false,
      },
      {
        name: 'startArg',
        description: 'Starting point (name or coordinates)',
        type: 'string | Array3 | Vector3',
        optional: false,
      },
      {
        name: 'endArg',
        description: 'Ending point (name or coordinates)',
        type: 'string | Array3 | Vector3',
        optional: false,
      },
    ],
    example: 'createLine("line1", "sat", [0, 0, 0]);',
  },

  angle: {
    description: 'Calculates the angle between two vectors in radians.',
    parameters: [
      {
        name: 'vec1',
        description: 'First vector (name or coordinates)',
        type: 'string | Array3 | Vector3',
        optional: false,
      },
      {
        name: 'vec2',
        description: 'Second vector (name or coordinates)',
        type: 'string | Array3 | Vector3',
        optional: false,
      },
    ],
    returns: {
      type: 'number',
      description: 'Angle in radians',
    },
    example: 'const angleRad = angle("sat->target", [0, 0, 1]);',
  },

  rad2deg: {
    description: 'Converts radians to degrees.',
    parameters: [
      {
        name: 'x',
        description: 'Angle in radians',
        type: 'number',
        optional: false,
      },
    ],
    returns: {
      type: 'number',
      description: 'Angle in degrees',
    },
    example: 'const angleDeg = rad2deg(Math.PI); // 180',
  },

  deg2rad: {
    description: 'Converts degrees to radians.',
    parameters: [
      {
        name: 'x',
        description: 'Angle in degrees',
        type: 'number',
        optional: false,
      },
    ],
    returns: {
      type: 'number',
      description: 'Angle in radians',
    },
    example: 'const angleRad = deg2rad(180); // Math.PI',
  },

  fetchTLE: {
    description: 'Fetches TLE data for a satellite by NORAD ID.',
    parameters: [
      {
        name: 'norad_id',
        description: 'NORAD ID of the satellite',
        type: 'string',
        optional: false,
      },
    ],
    returns: {
      type: 'Promise<string>',
      description: 'TLE data as a string',
    },
    example: 'const tleLine = await fetchTLE("25544"); // ISS',
  },

  mov2sat: {
    description:
      "Moves a point to match a satellite's position at a specific time.",
    parameters: [
      {
        name: 'name',
        description: 'Name of the point to move',
        type: 'string',
        optional: false,
      },
      {
        name: 'cosparId',
        description: 'COSPAR ID of the satellite',
        type: 'string',
        optional: false,
      },
      {
        name: 'timestamp',
        description: 'Time at which to calculate the satellite position',
        type: 'Date',
        optional: false,
      },
    ],
    example: 'mov2sat("tracker", "25544", new Date());',
  },

  findBestQuaternion: {
    description:
      'Calculates the optimal quaternion to align two pairs of vectors.',
    parameters: [
      {
        name: 'primaryBodyVector',
        description: 'Primary vector in body frame',
        type: 'Array3 | string | Vector3',
        optional: false,
      },
      {
        name: 'secondaryBodyVector',
        description: 'Secondary vector in body frame',
        type: 'Array3 | string | Vector3',
        optional: false,
      },
      {
        name: 'primaryTargetVector',
        description: 'Primary target vector',
        type: 'Array3 | string | Vector3',
        optional: false,
      },
      {
        name: 'secondaryTargetVector',
        description: 'Secondary target vector',
        type: 'Array3 | string | Vector3',
        optional: false,
      },
    ],
    returns: {
      type: '[number, number, number, number]',
      description: 'Quaternion as [x, y, z, w]',
    },
    example:
      'const quat = findBestQuaternion([0, 0, 1], [1, 0, 0], "sat->target", [0, 1, 0]);',
  },

  point: {
    description: 'Gets a point object by name.',
    parameters: [
      {
        name: 'point',
        description: 'Name of the point',
        type: 'string',
        optional: false,
      },
    ],
    returns: {
      type: 'Point | null',
      description: 'The point object or null if not found',
    },
    example: 'const satPoint = point("sat");',
  },

  camera: {
    description: 'Gets a camera by name.',
    parameters: [
      {
        name: 'name',
        description: 'Name of the camera',
        type: 'string',
        optional: false,
      },
    ],
    returns: {
      type: 'THREE.Camera | null',
      description: 'The camera object or null if not found',
    },
    example: 'const mainCam = camera("main");',
  },

  relativeRot: {
    description: 'Applies a relative rotation to a point.',
    parameters: [
      {
        name: 'point_name',
        description: 'Name of the point to rotate',
        type: 'string',
        optional: false,
      },
      {
        name: 'q',
        description: 'Quaternion as [x, y, z, w] array',
        type: 'Vector4',
        optional: false,
      },
    ],
    example:
      'relativeRot("sat", [0, 0, 0.7071, 0.7071]); // 90 degree rotation around Z',
  },

  reset: {
    description: 'Resets the scene to its initial state.',
    parameters: [
      {
        name: 'cleanupPlots',
        description: 'Whether to also remove plots',
        type: 'boolean',
        optional: true,
        defaultValue: 'false',
      },
    ],
    example:
      'reset(); // Reset scene\nreset(true); // Reset scene and remove plots',
  },

  resumeSimTime: {
    description: 'Resumes the simulation time flow.',
    parameters: [],
    example: 'resumeSimTime();',
  },

  pauseSimTime: {
    description: 'Pauses the simulation time flow.',
    parameters: [],
    example: 'pauseSimTime();',
  },

  toggleSimTime: {
    description: 'Toggles the simulation time flow between paused and running.',
    parameters: [],
    example: 'toggleSimTime();',
  },

  setTime: {
    description: 'Sets the simulation time to a specific date.',
    parameters: [
      {
        name: 'newTime',
        description: 'New simulation time',
        type: 'Date',
        optional: false,
      },
    ],
    example: 'setTime(new Date("2023-01-01T12:00:00Z"));',
  },

  listPoints: {
    description: 'Lists all points in the scene.',
    parameters: [],
    returns: {
      type: 'string[]',
      description: 'Array of point names',
    },
    example: 'const points = listPoints();',
  },

  deletePoint: {
    description: 'Deletes a point from the scene.',
    parameters: [
      {
        name: 'name',
        description: 'Name of the point to delete',
        type: 'string',
        optional: false,
      },
    ],
    example: 'deletePoint("target");',
  },

  resumeTrail: {
    description: 'Resumes trail generation for a satellite.',
    parameters: [
      {
        name: 'satelliteName',
        description: 'Name of the satellite',
        type: 'string',
        optional: false,
      },
    ],
    example: 'resumeTrail("ISS");',
  },

  pauseTrail: {
    description: 'Pauses trail generation for a satellite.',
    parameters: [
      {
        name: 'satelliteName',
        description: 'Name of the satellite',
        type: 'string',
        optional: false,
      },
    ],
    example: 'pauseTrail("ISS");',
  },

  toggleTrail: {
    description: 'Toggles trail generation for a satellite.',
    parameters: [
      {
        name: 'satelliteName',
        description: 'Name of the satellite',
        type: 'string',
        optional: false,
      },
    ],
    example: 'toggleTrail("ISS");',
  },

  createPlot: {
    description: 'Creates a data plot.',
    parameters: [
      {
        name: 'id',
        description: 'Unique ID for the plot',
        type: 'string',
        optional: false,
      },
      {
        name: 'config',
        description: 'Plot configuration',
        type: 'object',
        optional: false,
      },
      {
        name: 'callback',
        description: 'Function that returns data points',
        type: 'Function',
        optional: false,
      },
    ],
    example:
      'createPlot("angle-plot", { title: "Pointing Error", lines: ["error"] }, () => [angle("sat->target", [0, 0, 1])]);',
  },

  removePlot: {
    description: 'Removes a plot.',
    parameters: [
      {
        name: 'id',
        description: 'ID of the plot to remove',
        type: 'string',
        optional: false,
      },
    ],
    example: 'removePlot("angle-plot");',
  },

  showSecondaryView: {
    description: 'Shows the secondary view with a specific camera.',
    parameters: [
      {
        name: 'camera',
        description: 'Camera to use for the secondary view',
        type: 'THREE.PerspectiveCamera',
        optional: false,
      },
    ],
    example: 'showSecondaryView(point("sat").camera);',
  },

  hideSecondaryView: {
    description: 'Hides the secondary view.',
    parameters: [],
    example: 'hideSecondaryView();',
  },

  addWebMercatorTile: {
    description: 'Adds a Web Mercator tile to the scene.',
    parameters: [
      {
        name: 'x',
        description: 'X coordinate of the tile',
        type: 'number',
        optional: false,
      },
      {
        name: 'y',
        description: 'Y coordinate of the tile',
        type: 'number',
        optional: false,
      },
      {
        name: 'z',
        description: 'Zoom level of the tile',
        type: 'number',
        optional: false,
      },
    ],
    example: 'addWebMercatorTile(1, 1, 2);',
  },

  longRunning: {
    description:
      'Runs a long calculation in a web worker to avoid blocking the UI.',
    parameters: [
      {
        name: 'iterations',
        description: 'Number of iterations to run',
        type: 'number',
        optional: true,
        defaultValue: '100000000',
      },
    ],
    returns: {
      type: 'Promise<void>',
      description: 'Promise that resolves when the calculation is complete',
    },
    example: 'await longRunning(1000000);',
  },

  zyxToQuaternion: {
    description: 'Converts ZYX Euler angles to a quaternion.',
    parameters: [
      {
        name: 'z',
        description: 'Z rotation in radians',
        type: 'number',
        optional: false,
      },
      {
        name: 'y',
        description: 'Y rotation in radians',
        type: 'number',
        optional: false,
      },
      {
        name: 'x',
        description: 'X rotation in radians',
        type: 'number',
        optional: false,
      },
    ],
    returns: {
      type: 'Vector4',
      description: 'Quaternion as [x, y, z, w]',
    },
    example:
      'const quat = zyxToQuaternion(Math.PI/2, 0, 0); // 90 degree rotation around Z',
  },

  geo2xyz: {
    description: 'Converts geographic coordinates to ECEF XYZ coordinates.',
    parameters: [
      {
        name: 'geo',
        description: 'Geographic coordinates [latitude, longitude, altitude]',
        type: 'Array3',
        optional: false,
      },
    ],
    returns: {
      type: 'Array3',
      description: 'ECEF coordinates [x, y, z]',
    },
    example: 'const ecef = geo2xyz([45.0, -75.0, 0]); // Ottawa, Canada',
  },

  xyz2geo: {
    description: 'Converts ECEF XYZ coordinates to geographic coordinates.',
    parameters: [
      {
        name: 'xyz',
        description: 'ECEF coordinates [x, y, z]',
        type: 'Array3',
        optional: false,
      },
    ],
    returns: {
      type: 'Array3',
      description: 'Geographic coordinates [latitude, longitude, altitude]',
    },
    example:
      'const geo = xyz2geo([6378137, 0, 0]); // [0, 0, 0] (equator at prime meridian)',
  },

  sph2xyz: {
    description: 'Converts spherical coordinates to Cartesian coordinates.',
    parameters: [
      {
        name: 'sph',
        description: 'Spherical coordinates [radius, theta, phi]',
        type: 'Array3',
        optional: false,
      },
    ],
    returns: {
      type: 'Array3',
      description: 'Cartesian coordinates [x, y, z]',
    },
    example: 'const xyz = sph2xyz([1, Math.PI/2, 0]); // [0, 1, 0]',
  },

  xyz2sph: {
    description: 'Converts Cartesian coordinates to spherical coordinates.',
    parameters: [
      {
        name: 'xyz',
        description: 'Cartesian coordinates [x, y, z]',
        type: 'Array3',
        optional: false,
      },
    ],
    returns: {
      type: 'Array3',
      description: 'Spherical coordinates [radius, theta, phi]',
    },
    example: 'const sph = xyz2sph([0, 1, 0]); // [1, Math.PI/2, 0]',
  },

  utcDate: {
    description: 'Creates a UTC date from components.',
    parameters: [
      {
        name: 'year',
        description: 'Year',
        type: 'number',
        optional: false,
      },
      {
        name: 'month',
        description: 'Month (1-12)',
        type: 'number',
        optional: false,
      },
      {
        name: 'day',
        description: 'Day of month',
        type: 'number',
        optional: false,
      },
      {
        name: 'hour',
        description: 'Hour (0-23)',
        type: 'number',
        optional: true,
        defaultValue: '0',
      },
      {
        name: 'minute',
        description: 'Minute (0-59)',
        type: 'number',
        optional: true,
        defaultValue: '0',
      },
      {
        name: 'second',
        description: 'Second (0-59)',
        type: 'number',
        optional: true,
        defaultValue: '0',
      },
      {
        name: 'millisecond',
        description: 'Millisecond (0-999)',
        type: 'number',
        optional: true,
        defaultValue: '0',
      },
    ],
    returns: {
      type: 'Date',
      description: 'UTC Date object',
    },
    example:
      'const date = utcDate(2023, 1, 1, 12, 0, 0); // 2023-01-01 12:00:00 UTC',
  },

  findMercatorTilesInPOV: {
    description:
      'Finds Web Mercator tiles visible in the current point of view.',
    parameters: [
      {
        name: 'camera',
        description: 'Camera to use for the point of view',
        type: 'THREE.Camera',
        optional: false,
      },
      {
        name: 'zoom',
        description: 'Zoom level for the tiles',
        type: 'number',
        optional: false,
      },
    ],
    returns: {
      type: 'Array<{x: number, y: number, z: number}>',
      description: 'Array of tile coordinates',
    },
    example: 'const tiles = findMercatorTilesInPOV(camera("main"), 5);',
  },
};
