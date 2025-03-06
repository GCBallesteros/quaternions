# Point Classes Overview

The `Point`, `OrientedPoint`, and `Satellite` classes represent points in 3D space with increasing levels of functionality.

## Class Hierarchy

- **[`Point`](/dsl/classes/point)** is the base class representing a point with a position in 3D space.

- **[`OrientedPoint`](/dsl/classes/orientedPoint)** extends `Point` and adds orientation information using quaternions. It can also have a camera attached for scene rendering and perspective control.

- **[`Satellite`](/dsl/classes/satellite)** extends `OrientedPoint` and adds a description of the satellite motion along its orbit through the use of a TLE and includes instructions on how the satellite should be oriented as a function of time.

## Usage

Points can be retrieved from the scene via the [`point`](/dsl/commands/point) function. These classes are seldom interacted with directly except through this function. When we do retrieve them, it is mostly to use the getter methods. For example, when we want the basis vector for the reference frame of an `OrientedPoint`.

```javascript
// Get a point by name
const sat = point("sat");

// Access properties
const position = sat.position;
const color = sat.color;

// For OrientedPoint, access frame vectors
if (sat instanceof OrientedPoint) {
  const xAxis = sat.frame.x;
  const yAxis = sat.frame.y;
  const zAxis = sat.frame.z;
}

// For Satellite, access trail
if (sat instanceof Satellite && sat.hasTrail) {
  sat.enableTrail();
}
```
