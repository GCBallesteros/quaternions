# Point Classes


The `Point`, `OrientedPoint` and `Satellite` classes represent points in 3D space
with increasing levels of functionality.


- **[`Point`](/dsl/points/point)** is the base class representing a point with a position in 3D
space.  

- **[`OrientedPoint`](/dsl/points/orientedPoint)** extends `Point` and adds orientation information using
quaternions. It can also have a camera attached for scene rendering and
perspective control.

- **[`Satellite`](/dsl/points/satellite)**, finally add to `OrientedPoint` a description of the satellite
motion along its orbit through the use of a TLE and include instructions on how
the satellite should be oriented as a functon of time.

Points can be retrieved from the scene via the `point` function (see below).
These classes are seldomly interacted with directly except through the latter
function. When we do retrieve them, it is mostly to use the getter methods. For
example, when we want the basis vector for the reference frame of an
`OrientedPoint`.
