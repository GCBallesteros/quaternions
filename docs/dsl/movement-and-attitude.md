#AI
# Movement & Attitude Commands

## `rot`

Rotates the point to match the orientation implied by the passed in quaternion.

| Parameter      | Type     | Description                                   |
|----------------|----------|-----------------------------------------------|
| `point_name`  | `string` | The name of the point to rotate.             |
| `q`           | `array`  | A quaternion `[x, y, z, w]` for the rotation.|

**Example**:
```js
rot("sat", [0, 0, 0, 1]);
```

## `mov`

Moves a named point to a specific latitude, longitude, and altitude.

| Parameter      | Type     | Description                                                                 |
|----------------|----------|-----------------------------------------------------------------------------|
| `point_name`  | `string` | The name of the point to move.                                              |
| `pos`         | `array`  | The position interpreted as geographical or Cartesian coordinates. See `use_geo`.|
| `use_geo`     | `bool`   | If true, assumes `pos` is provided as `[lat, long, alt]`; otherwise as `[x, y, z]`. Default is false.|

**Example**:
```js
mov("satellite1", 45.0, -93.0, 500);
```

## `mov2sat`

Moves a point to the position of a satellite at a given timestamp.


| Parameter      | Type     | Description                                                                 |
|----------------|----------|-----------------------------------------------------------------------------|
| `name`        | `string` | The name of the point to move.                                              |
| `cosparId`    | `string` | COSPAR ID of the satellite.                                                  |
| `timestamp`   | `Date`   | The time for which the position is computed.                                |

**Example**:
```js
// Move the `sat` point to the current position of the object with
// NORAD catalog number 60562 
mov2sat("sat", "60562", new Date());
```

## `findBestQuaternion`


| Parameter           | Type           | Description                                                                 |
|---------------------|----------------|-----------------------------------------------------------------------------|
| `primaryVecArg`     | `array\|string` | Primary body vector as a 3-element array or string (`"x"`, `"y"`, or `"z"`).|
| `secondaryVecArg`   | `array\|string` | Secondary body vector as a 3-element array or string (`"x"`, `"y"`, or `"z"`).|
| `primaryTargetArg`  | `array\|string` | Target vector for the primary vector. See valid input options [here](/dsl/overview/#supplying-vectors-and-positions-by-name-or-value)|
| `secondaryTargetArg`| `array\|string` | Target vector for the secondary vector. See valid input options [here](/dsl/overview/#supplying-vectors-and-positions-by-name-or-value)|

**Returns**: An array `[x, y, z, w]` corresponding to the quaternion.

**Example**:

```javascript
const quaternion = findBestQuaternion(
  state,
  "x",
  [0, 1, 0],
  "A->B",
  [0, 0, 1],
);

