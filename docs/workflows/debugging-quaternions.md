# Debugging Quaternions

This workflow demonstrates how to debug quaternion orientations by moving a
satellite, adding points of interest, and calculating angles to verify the
orientation. The process involves positioning the satellite, creating a
reference point, and analyzing the angle between a line and the satellite's
local axis.

Here is the full code for the workflow which you can copy/paste directly
into the integrated editor and click on excute.

```javascript
let satellitePosition = [62.0, 34.0, 500.0];
mov("sat", satellitePosition, true);

let pointOfInterestCoords = geo2xyz([60.186, 24.828, 0]);
add_point("KS", pointOfInterestCoords);

create_line("sat2KS", "sat", "KS");

let rotationQuaternion = [-0.6313439, -0.1346824, -0.6313439, -0.4297329];
rot("sat", rotationQuaternion);

let angle_between_pointing_and_target = angle(
     "sat2KS", point("sat").frame.z
);

// Use the [`log`](/dsl/utility/#log) function to display the calculated angle in the integrated console
log(angle_between_pointing_and_target);
```

Let’s break that down with additional details about what happens under the hood.

By default, an **OrientedPoint** named `sat` is created for convenience. This
represents a satellite and is initialized with a default position and
orientation. This saves time for workflows that require a satellite as a
starting point.


## 1. Position the Satellite

Move the default point (`sat`) near Helsinki using the [`mov`](/dsl/movement-and-attitude/#mov) command. The
latitude is 62°, the longitude is 34°, and the altitude is 500 km. The `true`
parameter specifies that the provided coordinates are geographic (latitude,
longitude, altitude) instead of Earth-Centered, Earth-Fixed (ECEF) coordinates
provided in xyz form.

```javascript
let satellitePosition = [62.0, 34.0, 500.0];
mov("sat", satellitePosition, true);
```


## 2. Define a Point of Interest

Convert the geographic coordinates (60.186°N, 24.828°E, 0 m altitude) to ECEF
coordinates using [`geo2xyz`](/dsl/geometry-commands/#geo2xyz). Add a point (`KS`) at the calculated location.
When a point is added using the [`add_point`](/dsl/geometry-commands/#add_point) function, it is registered with the
provided name (in this case, `KS`), so it can be referred to later.

```javascript
let pointOfInterestCoords = geo2xyz([60.186, 24.828, 0]);
add_point("KS", pointOfInterestCoords);
```

## 3. Connect the Satellite and Point

Create a line (`sat2KS`) between the satellite and the point of interest to
visualize their connection. The [`create_line`](/dsl/geometry-commands/#create_line) function can take either:
- The names of registered points (e.g., `"sat"` and `"KS"`)
- Raw ECEF coordinates (tuples of three numbers)

Here, we use the registered points for simplicity and clarity.

```javascript
create_line("sat2KS", "sat", "KS");
```

## 4. Rotate the Satellite and Analyze Orientation

1. Apply a quaternion rotation (`rotationQuaternion`) to simulate an incorrect
satellite orientation using the [`rot`](/dsl/movement-and-attitude/#rot) function.
2. Calculate the angle between the satellite's z-axis and the line `sat2KS`.
The [`point`](/dsl/points/#point) function retrieves the **OrientedPoint** registered as `sat`. This
object provides access to the `frame` property, which describes the local axes
of the satellite.

```javascript
let rotationQuaternion = [-0.6313439, -0.1346824, -0.6313439, -0.4297329];
rot("sat", rotationQuaternion);

angle("sat2KS", point("sat").frame.z);
```

Alternatively, we could have defined the first argument of angle using the
special notation `point_name_start->point_name_end`, which in this case
would've resulted on `sat->ks`. Like this we would have defined the vector for
the angle calculation without having to explicitly create a line. We did the
latter so that an actual line would be drawn on the scene.
