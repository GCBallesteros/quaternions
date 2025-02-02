# Utility Commands

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
