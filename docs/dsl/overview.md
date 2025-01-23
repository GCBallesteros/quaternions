# Overview

**What on Earth?** introduces a small Domain-Specific Language (DSL) for
working with 3D scenes. The DSL helps you create and control points, lines, and
shapes to manage satellite positioning, orientation, and visualization.

Before proceeding, here are some useful things to know about how the app works:

## Useful information!

### Quaternions are in xyzw order

All functions that take quaternions expect a `[number, number, number, number]`
and this should be provided in xyzw order! Functions that return quaternions
will also follow this convetions.

### App state is maintained across script executions

The app maintains the state of the 3D scene between consecutive script
executions. This means any points, lines, or transformations you create will
remain until you explicitly reset the state. To clear everything and start
fresh, you can call:

```javascript
reset();
```

### Default Points and Lines

To make it easier to get started, the app initializes with these default
elements:

- **Point: `"sat"`**  

  Represents a satellite positioned at a predefined location. It is an
`OrientedPoint` with a local frame and can be used as a reference for
orientation and transformations.

- **Line: `"nadir"`**  

  Represents the satellite's nadir, the line connecting the `"sat"` point to
the center of the Earth. This line is helpful for visualizing the satellite's
position relative to the Earth's surface.

### Supplying vectors and positions by name or value

Most places that expect a point can either take the name of one that has
been previously defined or a `[number, number, number]`. Similarly there
is special rules for arguments that expect a vector. Most of the time one of the
following 3 will be valid:

1. A 3-element array representing the target vector.
2. A string of the form "startPoint->endPoint" to define a vector between two points.
3. The name of a previously created line. It's direction will be used as input.


### Accessing and Modifying State

The entire state of the scene is accessible through the built-in `state`
variable. While you can manipulate the `state` object directly, be cautious
when doing so, as improper changes can cause unexpected behavior. Most of the
time, it's better to use the provided commands for managing points, lines, and
transformations.


## DSL Overview

### 1. [**Point Types**](/dsl/points)  

Learn about the `Point` and `OrientedPoint` classes, which are the building
blocks for representing objects in 3D space. The `OrientedPoint` extends
`Point` to include orientation, enabling operations like attitude control and
visualization.

### 2. [**Movement & Attitude Commands**](/dsl/movement-and-attitude)  

Discover commands to manipulate points' positions and orientations, such as
`mov`, `rot`, and `mov2sat`. Tools for quaternion-based attitude adjustment are
also introduced.

### 4. [**Geometry Commands**](/dsl/geometry-commands)  

Explore tools for creating and managing points, lines, and angles in the scene.
Examples include `add_point`, `create_line`, and `angle`.

### 5. [**Camera Commands**](/dsl/cameras)

Learn how to manage multiple cameras in the scene, switch between different views,
and work with cameras attached to points.

### 6. [**Utility Commands**](/dsl/utility)  

Access helpful mathematical and satellite-related utilities, including
coordinate conversions (`geo2xyz`, `xyz2geo`) and fetching Two-Line Elements
(TLE) with `fetchTLE`.
