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
