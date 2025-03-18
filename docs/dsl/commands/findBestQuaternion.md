# findBestQuaternion

Computes the optimal quaternion to align two pairs of vectors.

The `findBestQuaternion` function computes the optimal quaternion to align two
pairs of vectors. The primary vector (defined in the body frame) will be
exactly aligned with its target, while the secondary vector (also in body
frame) will be aligned as closely as possible with its target while maintaining
the primary alignment.

This function is particularly useful for determining the correct orientation
for satellites and other objects that need to point in specific directions.


## Syntax

```javascript
findBestQuaternion(
  primaryBodyVector: string | Array3 | Vector3,
  secondaryBodyVector: string | Array3 | Vector3,
  primaryTargetVector: string | Array3 | Vector3,
  secondaryTargetVector: string | Array3 | Vector3,
): Array4
```

## Parameters

| Parameter               | Description                                                                   |
|-------------------------|-------------------------------------------------------------------------------|
| `primaryBodyVector`     | Primary body vector as a 3-element array or string (`"x"`, `"y"`, or `"z"`).  |
| `secondaryBodyVector`   | Secondary body vector as a 3-element array or string (`"x"`, `"y"`, or `"z"`).|
| `primaryTargetVector`   | Target vector for the primary vector. Can use special notation for vectors.   |
| `secondaryTargetVector` | Target vector for the secondary vector. Can use special notation for vectors. |

The following are allowed forms for the parameters:

1. A 3-element array representing the vector: `[x, y, z]`
2. A string representing a body axis: `"x"`, `"y"`, or `"z"` (only for BodyVector)
3. A string of the form `"pointA->pointB"` to define a vector between two points
4. The name of a previously created line
5. Special named targets like `"Moon"`, `"Sun"`, `"Nadir"`, or `"Velocity"`

## Returns

`Array4`

A quaternion `[x, y, z, w]` representing the optimal orientation.



## Examples

### Basic alignment

```javascript
// Find quaternion to point z-axis at the Moon with y-axis aligned with velocity
const quaternion = findBestQuaternion(
  "z",                  // Primary body vector (z-axis)
  "y",                  // Secondary body vector (y-axis)
  NamedTargets.Moon,    // Primary target (Moon)
  NamedTargets.Velocity // Secondary target (velocity vector)
);

// Apply the calculated quaternion
rot("sat", quaternion);
```

### Using vector between points

```javascript
// Find quaternion to point z-axis at a target point with y-axis pointing north
const quaternion = findBestQuaternion(
  "z",                  // Primary body vector (z-axis)
  "y",                  // Secondary body vector (y-axis)
  "sat->target",        // Vector from sat to target
  [0, 0, 1]             // North in ECEF frame
);
```

## Related

- [`rot`](/dsl/commands/rot) - Rotates a point to match a specific orientation
- [`angle`](/dsl/commands/angle) - Calculates the angle between two vectors
