# API Reference

This page serves as a comprehensive index of all available commands in the What on Earth? DSL. Each command links to its detailed documentation page.

## Movement & Positioning

| Command | Description |
|---------|-------------|
| [`mov`](/dsl/commands/mov) | Moves a point to a specific position |
| [`rot`](/dsl/commands/rot) | Rotates a point to match a specific orientation |
| [`relativeRot`](/dsl/commands/relativeRot) | Applies a relative rotation to a point |
| [`mov2sat`](/dsl/commands/mov2sat) | Moves a point to a satellite's position |

## Points & Geometry

| Command | Description |
|---------|-------------|
| [`addPoint`](/dsl/commands/addPoint) | Adds a new point to the scene |
| [`deletePoint`](/dsl/commands/deletePoint) | Removes a point from the scene |
| [`listPoints`](/dsl/commands/listPoints) | Lists all points in the scene |
| [`point`](/dsl/commands/point) | Retrieves a point by name |
| [`createLine`](/dsl/commands/createLine) | Creates a line between two points |
| [`angle`](/dsl/commands/angle) | Calculates the angle between two vectors |

## Satellite Operations

| Command | Description |
|---------|-------------|
| [`addSatellite`](/dsl/commands/addSatellite) | Adds a satellite to the scene |
| [`fetchTLE`](/dsl/commands/fetchTLE) | Fetches TLE data for a satellite |
| [`findBestQuaternion`](/dsl/commands/findBestQuaternion) | Computes optimal quaternion for alignment |

## Camera Controls

| Command | Description |
|---------|-------------|
| [`camera`](/dsl/commands/camera) | Retrieves a camera by name |
| [`switchCamera`](/dsl/commands/switchCamera) | Switches to a different camera view |
| [`showSecondaryView`](/dsl/commands/showSecondaryView) | Shows a secondary camera view |
| [`hideSecondaryView`](/dsl/commands/hideSecondaryView) | Hides the secondary camera view |

## Time Controls

| Command | Description |
|---------|-------------|
| [`setTime`](/dsl/commands/setTime) | Sets the simulation time |
| [`pauseSimTime`](/dsl/commands/pauseSimTime) | Pauses the simulation time |
| [`resumeSimTime`](/dsl/commands/resumeSimTime) | Resumes the simulation time |
| [`toggleSimTime`](/dsl/commands/toggleSimTime) | Toggles the simulation time state |

## Trail Controls

| Command | Description |
|---------|-------------|
| [`resumeTrail`](/dsl/commands/resumeTrail) | Resumes a satellite's trail |
| [`pauseTrail`](/dsl/commands/pauseTrail) | Pauses a satellite's trail |
| [`toggleTrail`](/dsl/commands/toggleTrail) | Toggles a satellite's trail state |

## Plotting & Visualization

| Command | Description |
|---------|-------------|
| [`createPlot`](/dsl/commands/createPlot) | Creates a data plot |
| [`removePlot`](/dsl/commands/removePlot) | Removes a data plot |
| [`addWebMercatorTile`](/dsl/commands/addWebMercatorTile) | Adds a web mercator tile to the scene |

## Utility Functions

| Command | Description |
|---------|-------------|
| [`reset`](/dsl/commands/reset) | Resets the scene to its initial state |
| [`log`](/dsl/commands/log) | Logs a message to the console |
| [`rad2deg`](/dsl/commands/rad2deg) | Converts radians to degrees |
| [`deg2rad`](/dsl/commands/deg2rad) | Converts degrees to radians |
| [`geo2xyz`](/dsl/commands/geo2xyz) | Converts geographic to Cartesian coordinates |
| [`xyz2geo`](/dsl/commands/xyz2geo) | Converts Cartesian to geographic coordinates |
| [`sph2xyz`](/dsl/commands/sph2xyz) | Converts spherical to Cartesian coordinates |
| [`xyz2sph`](/dsl/commands/xyz2sph) | Converts Cartesian to spherical coordinates |
| [`utcDate`](/dsl/commands/utcDate) | Creates a UTC date |
| [`zyxToQuaternion`](/dsl/commands/zyxToQuaternion) | Converts Euler angles to quaternion |
| [`longRunning`](/dsl/commands/longRunning) | Executes a long-running calculation |
