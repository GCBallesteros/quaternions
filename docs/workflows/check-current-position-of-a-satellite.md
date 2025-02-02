# Check Current Position of a Satellite

This workflow demonstrates how to move a point in the visualizer to a
satellite's position at a specific time. The satellites are identified by their
[NORAD Catalog Number](https://en.wikipedia.org/wiki/Satellite_Catalog_Number).

We'll use two main functions:

- [`setTime`](/dsl/movement-and-attitude/#settime) to set the simulation time
- [`mov2sat`](/dsl/movement-and-attitude/#mov2sat) to position the satellite
based on its TLE at that time

Here is the code that you can run directly in the integrated editor:

```javascript
// Set simulation to current time and move satellite
let now = new Date();
setTime(now);
await mov2sat("sat", "60562", now);
```

:::tip
If you were following along with the previous workflow you might want to start
your script with [`reset()`](/dsl/overview/#app-state-is-maintained-across-script-executions) which will return the state of the scene to the
default one. Having it up there is particularly useful when you are iterating
over your script.
:::

Since this is just JavaScript, you can calculate dates however you prefer. For example, to see where the satellite was one hour ago:

```javascript
let currentDate = new Date();
let previousHour = new Date(currentDate.getTime() - (60 * 60 * 1000));

setTime(previousHour);
await mov2sat("sat", "60562", previousHour);
```

Or to check its position at a specific date and time:

```javascript
let specificDate = new Date('2025-01-01T15:25:00Z');
setTime(specificDate);
await mov2sat("sat", "60562", specificDate);
```

The `setTime` function updates time-dependent elements in the scene, specifically
the Sun's position relative to Earth to match the illumination conditions at that
time. Note that `setTime` does not move the satellite - you need to use `mov2sat`
to position the satellite at the desired time.

::: warning
You will be fetching the most recent TLE from
[Celestrak](https://www.celestrak.com). Keep in mind that the further into the
future or the past with respect to now that you go the less accurate the
position will be.
:::

### Finding NORAD IDs

You can easily find the NORAD ID  of satellites on
[Celestrak](https://www.celestrak.com/NORAD/elements/). Simply search for the
satellite by name or use other relevant categories (such as weather satellites,
GPS, etc.) to find the NORAD ID.

The NORAD ID is a unique identifier assigned to each satellite, and is
necessary to fetch the satellite's position in real-time.

### Example Resources

- [Celestrak NORAD Satellite
Catalog](https://www.celestrak.com/NORAD/elements/): Search for satellites and
their corresponding NORAD IDs.
- [TLE Data](https://www.celestrak.com/NORAD/elements/stations.txt): A text
file listing current Two-Line Element (TLE) sets for satellites, which are
required to calculate their positions.
