# mov2sat

Moves a point to the position of a satellite at a given timestamp.

The `mov2sat` function moves a point to the position of a satellite at a specified time. It uses the satellite's Two-Line Element (TLE) data to calculate its position at the given timestamp.

This function is asynchronous and must be awaited, as it may need to fetch TLE data from external sources if it's not already cached.

## Syntax

```typescript
async mov2sat(name: string, cosparId: string, timestamp: Date): Promise<void>
```

## Parameters

| Parameter   | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `name`      | The name of the point to move.                                              |
| `cosparId`  | COSPAR ID (NORAD catalog number) of the satellite.                          |
| `timestamp` | The time for which the position is computed.                                |

## Returns

`Promise<void>` - This function must be awaited.

## Examples

### Moving a point to a satellite's current position

```javascript
// Move the point "sat" to the current position of satellite 60562
await mov2sat("sat", "60562", new Date());
```

### Moving a point to a satellite's position at a specific time

```javascript
// Move the point "sat" to the position of satellite 60562 on January 1, 2025
const specificDate = utcDate(2025, 1, 1, 12, 0, 0);
await mov2sat("sat", "60562", specificDate);
```

### Using with setTime to visualize satellite position

```javascript
// Set the simulation time to a specific date
const date = utcDate(2025, 1, 1, 12, 0, 0);
setTime(date);

// Move the point to the satellite's position at that time
await mov2sat("sat", "60562", date);
```

## Related

- [`addSatellite`](/dsl/commands/addSatellite) - Adds a satellite to the scene
- [`fetchTLE`](/dsl/commands/fetchTLE) - Fetches TLE data for a satellite
- [`mov`](/dsl/commands/mov) - Moves a point to a specific position
