# Utility Commands

## point

Returns a point from the scene state by name, or null if not found.

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| `point`   | `string` | The name of the point to retrieve     |

**Returns**: A `Point`, `OrientedPoint`, or `Satellite` instance if found, null otherwise.

**Example**:
```js
const sat = point("sat");
if (sat) {
  // Point exists, safe to use
  angle("nadir", sat.frame.x);
} else {
  // Point not found
  log("Satellite not found");
}
```

## camera

Returns a camera from the scene state by name, or null if not found.

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| `name`    | `string` | The name of the camera to retrieve    |

**Returns**: A `THREE.Camera` instance if found, null otherwise. Cameras can be found in:
- Built-in cameras (like 'main')
- Cameras attached to OrientedPoints or Satellites

**Example**:
```js
const cam = camera("sat1");
if (cam) {
  // Camera exists, safe to use
  // ... use camera ...
} else {
  // Camera not found
  log("Camera not found");
}
```

## log

Prints a message to the integrated console.

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| `message` | `any`    | The message or value to be displayed  |

**Example**:
```js
log("Hello World");
log(42);
log([1, 2, 3]);
```

## deg2rad

 Converts degrees to radians.

 | Parameter | Type     | Description         |
 |-----------|----------|---------------------|
 | `x`       | `number` | Angle in degrees    |

 ## rad2deg

 Converts radians to degrees.

 | Parameter | Type     | Description         |
 |-----------|----------|---------------------|
 | `x`       | `number` | Angle in radians    |

 ## fetchTLE

 Fetches the Two-Line Element (TLE) for a satellite using its COSPAR ID. This
function will perform a request to Celestrak.

 | Parameter   | Type     | Description                    |
 |-------------|----------|--------------------------------|
 | `norad_id`  | `string` | COSPAR ID of the satellite     |

 ## setTime

 Sets the current simulation time. This affects time-dependent calculations like
satellite positions.

 | Parameter   | Type     | Description                          |
 |-------------|----------|--------------------------------------|
 | `newTime`   | `Date`   | The new simulation time to set       |

 **Example**:
 ```js
 setTime(new Date('2024-01-24T12:00:00Z'))
 ```

## toggleSimTime

Toggles the simulation time between running and paused states. When running, time advances at the rate specified by the time multiplier.

**Example**:
```js
toggleSimTime() // If time was running, it will pause. If it was paused, it will resume.
```

## pauseSimTime

Pauses the simulation time. The simulation time will stop advancing until resumed.

**Example**:
```js
pauseSimTime() // Time stops advancing
```

## resumeSimTime

Resumes the simulation time. Time will begin advancing at the rate specified by the time multiplier.

**Example**:
```js
resumeSimTime() // Time begins advancing again
```

## haversineDistance

Calculates the great circle distance between two points on Earth using the haversine formula.

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| `lat1`    | `number` | Latitude of first point in degrees    |
| `lon1`    | `number` | Longitude of first point in degrees   |
| `lat2`    | `number` | Latitude of second point in degrees   |
| `lon2`    | `number` | Longitude of second point in degrees  |

**Returns**: Distance in kilometers between the two points along Earth's surface.

**Example**:
```js
// Calculate distance between London and New York
const distance = haversineDistance(51.5074, -0.1278, 40.7128, -74.0060);
log(`Distance: ${distance} km`);
```
