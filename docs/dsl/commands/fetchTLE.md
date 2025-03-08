# fetchTLE

Fetches the Two-Line Element (TLE) data for a given NORAD ID.

The `fetchTLE` function retrieves the latest TLE data for a satellite from the Celestrak database using its NORAD ID. The fetched TLE data is also cached in the application's state for later use.

## Syntax

```typescript
fetchTLE(norad_id: string): Promise<string>
```

## Parameters

| Parameter  | Description                                                                                                                                                                                                                            |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `norad_id` | The NORAD ID (also known as Catalog Number) of the satellite. This is a unique identifier assigned to each tracked object by the North American Aerospace Defense Command (NORAD). Must be provided as a string (e.g., `"25544"`). |

## Returns

`Promise<string>`

A Promise that resolves to a string containing the fetched TLE data. The TLE data is in the standard 3-line format.

## Examples

### Fetching TLE data for the International Space Station (ISS)

```javascript
// Fetch the TLE data for the ISS (NORAD ID 25544)
const tle_data = await fetchTLE("25544");
console.log(tle_data);
```

## Related

- [`addSatellite`](/dsl/commands/addSatellite) - Adds a new satellite to the scene using TLE data.
- [`mov2sat`](/dsl/commands/mov2sat) - Moves a point to the calculated position of a satellite at a specific time.
