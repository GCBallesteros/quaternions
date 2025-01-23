# Check Current Position of a Satellite

This workflow demonstrates how to move a point in the visualizer to the current
position of a satellite by fetching its TLE. The satellites are identified by
their [NORAD Catalog
Number](https://en.wikipedia.org/wiki/Satellite_Catalog_Number). To do this, we
will use the [`mov2sat`](/dsl/movement-and-attitude/#mov2sat) function, which fetches the satellite's position at a
given timestamp.

Here is the code that you can run directly on the integrated editor.

```javascript
mov2sat("sat", "60562", new Date());
```

:::tip
If you were following along with the previous workflow you might want to start
your script with [`reset()`](/dsl/overview/#app-state-is-maintained-across-script-executions) which will return the state of the scene to the
default one. Having it up there is particularly useful when you are iterating
over your script.
:::

Finally remember that this just javascript so you can calculate that Date however
you think it's better, for example you can move the `sat` point to wherever it
was one hour ago

```javascript
// Get the current date and time
let currentDate = new Date();

// Subtract one hour from the current date
let previousHour = new Date(currentDate.getTime() - (60 * 60 * 1000));  // Subtracting 1 hour

mov2sat("sat", "60562", previousHour);
```

or to an arbitrary date:

```javascript
let specificDate = new Date('2025-01-01T15:25:00Z');
mov2sat("sat", "60562", specificDate);
```

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

