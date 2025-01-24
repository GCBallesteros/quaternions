# What on Earth?

**What on Earth?** is a tool for exploring quaternions, geometry, and satellite
perspectives—all from the comfort of your browser. It provides an interactive
3D environemtn  to perform complex geometric calculations, visualize scenes
from a satellite’s viewpoint, and optimize quaternions under various
constraints.

## Key Features

- **Geometric Calculations**: Compute angles, distances, and other geometrical
properties.
- **Satellite Perspectives**: Simulate and analyze views from a satellite’s
camera, complete with orientation and field of view adjustments.
- **Quaternion Optimization**: Determine the best quaternion given constraints
such as:
  - Specific camera orientations.
  - Alignment of secondary vectors or targets.
- **User-Driven Scripting**: Write and execute scripts directly in the app’s
built-in editor using a custom API or DSL, enabling:
  - Adding new points or objects to the scene.
  - Performing calculations on-the-fly.
  - Automating workflows for repeated tasks.
  - Time-based simulations with adjustable simulation time
  - ... much more coming soon.

## Getting Started

Let's walk through a practical example of using **What on Earth?** to debug
quaternion orientations. This workflow will show you how to:

- Position a satellite
- Create reference points
- Analyze orientations
- Calculate angles between vectors

Here's a complete example you can copy/paste into the integrated editor:

```javascript
// Move the default point, `sat`, near Helsinki
mov("sat", [62.0, 34.0, 500.0], true);

// Kuva Space HQ
let ksCoords = geo2xyz([60.186, 24.828, 0]);
addPoint("KS", ksCoords);

// Create a line between satellite and point
create_line("sat2KS", "sat", "KS");

// Apply a test quaternion rotation
rot("sat", [-0.6313439, -0.1346824, -0.6313439, -0.4297329]);

// Calculate angle between satellite's z-axis and the line
angle("sat2KS", point("sat").frame.z);
```

Full details on how this example works can be found the [debugging quaternions
workflow example](/workflows/debugging-quaternions). For more examples and
detailed workflows, check out our [workflow guides](/workflows/overview).

## DSL Documentation

Dive into the scripting capabilities provided by the app’s DSL. [Read the
documentation](/dsl/overview).

