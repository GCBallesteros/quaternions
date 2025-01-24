# Debugging Quaternions and Using `findBestQuaternion`

This workflow extends the **Quaternion Debugging** workflow by introducing the
use of `findBestQuaternion` to fix the orientation of a satellite. In this
process, we use the function to align a body vector of the satellite in the
direction of  a target while keeping a second (body) vector as well aligned
with another direction. The goal is to align the satellite to a specific
attitude, improving its positioning and ensuring proper orientation.

For a detailed breakdown of the basic quaternion debugging process, you can
refer to the workflow at
[Debugging Quaternions](/workflows/debugging-quaternions).


## 1. Set up the simulation

As in the previous workflow, we start by setting up the scene and initializing
the satellite's position and orientation.

```javascript
// Reset scene so that we can hit execute repeatedly  on this sample 
// script without errors
[`reset()`](/dsl/overview/#app-state-is-maintained-across-script-executions);

// Simulation params
const target_coords_ecef = geo2xyz([60.186, 24.828, 0]);
const satellite_location_geo = [62.0, 34.0, 500.0];
// quaternions are in xyzw order
const satellite_bad_quat = [
    -0.6313439,
    -0.1346824,
    -0.6313439,
    -0.4297329
];

// Move the default point, 'sat', to somewhere somewhat near Helsinki
mov("sat", satellite_location_geo, true);
// Add a point over the previously calculated coords
add_point("KS", target_coords_ecef);
// Connect "sat" to new point
create_line("sat2KS", "sat", "KS");
// Rotate 'sat' to buggy quaternion
rot("sat", satellite_bad_quat);
// Calculate angle between z-axis of 'sat' and 'sat2KS'
angle("sat2KS", [`point`](/dsl/points/#point)("sat").frame.z);
```

Lets now  fix the satellite's orientation using the `findBestQuaternion`
function.

## 2. Correcting the Satellite's Orientation

In this example, we will correct the orientation of the satellite using
[`findBestQuaternion`](/dsl/movement-and-attitude/#findbestquaternion). We aim to point the satellite's local z-axis to the nadir
direction and align the secondary vector (in this case, the y-axis) as closely
as possible to the z-axis of the Earth-Centered, Earth-Fixed (ECEF) system.

```javascript
point("sat").addCamera(50);  // Add a "camera" to the satellite in the default orientation
let good_quat = findBestQuaternion(
    point("sat").cameraBodyDirection, // The satellite's body z-axis (camera direction)
    "y",                              // The secondary body vector (y-axis)
    "sat->KS",                        // The vector from sat to the target point "KS"
    [0, 0, 1]                         // The target for the secondary vector (aligning y-axis to Earth's z-axis)
);
rot("sat", good_quat);
```

A few things to note here are:

1. The arguments to `findBestQuaternion` can either be vectors of the form
`[number, number, number]` or named lines or vectors defined by the same
`point1->point2` we described for the angle function in the [Debugging
Quaternions](/workflows/debugging-quaternions) workflow.

2. **OrientedPoints** may have a _camera_ that by default is pointed in the
direction of the z-axis of the body frame. We can access the pointing direction
(if a camera has been added to the point) via the `cameraBodyDirection`


## 3. Visualizing the Results

By running the above code, you can adjust the satellite's orientation, so its
local axes match the desired directions. The `findBestQuaternion` function
returns a quaternion that rotates the satellite to the correct orientation,
aligning both its primary and secondary body vectors to the target directions.

Once the quaternion is applied, the satellite's rotation is corrected, and the
angle between the satellite's z-axis and the line from sat to KS will be
minimized.

With this method, you can easily correct the orientation of a satellite based
on its primary and secondary body vectors and their target directions, ensuring
accurate visualization and analysis in your 3D environment.
