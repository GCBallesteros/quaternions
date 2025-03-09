# What on Earth?


A script-driven interactive environment for simulating and analyzing satellite
orientation and system dynamics. It provides an interactive 3D environment to
perform complex geometric calculations, visualize scenes from a satellite’s
viewpoint, and optimize quaternions under various constraints.


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

### User Interface


![User Interface](/assets/main_ui.png)

The application interface is divided into the following areas:

1. **Simulation View** (Left): The main 3D visualization area showing the
  Earth globe, satellite points, and other geometric elements. You can rotate
and zoom the view using your mouse.

2. **Code Editor** (Right): A full-featured code editor where you can write
  and edit your script using the application's DSL. The editor includes
syntax highlighting and auto-completion features.

3. **Execute Button**: Located below the editor, this button runs your current
  script and update the simulation accordingly.                                           

4. **Settings Tabs**: On the left edge of the editor panel, vertical tabs
  provide access to additional features:

  - **Editor**: The main coding interface
  - **Settings**: Configuration options for the simulation, including time
  controls and visualization settings

### Example workflow

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
createLine("sat2KS", "sat", "KS");

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

