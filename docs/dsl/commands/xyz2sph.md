# xyz2sph

Converts Cartesian coordinates to spherical coordinates.

## Syntax

```javascript
xyz2sph(point)
```

## Parameters

| Parameter | Type                | Description                           |
|-----------|---------------------|---------------------------------------|
| `point`   | `Array3` or `Vector3` | Cartesian coordinates `[x, y, z]`     |

## Returns

`Array3` - Spherical coordinates as `[latitude, longitude, radius]` where:
- `latitude` is in degrees (-90° to 90°)
- `longitude` is in degrees (-180° to 180°)
- `radius` is the distance from the origin in kilometers

## Description

The `xyz2sph` function converts Cartesian (ECEF) coordinates to spherical coordinates. This is useful for converting from Earth-Centered Earth-Fixed (ECEF) coordinates to a more human-readable format of latitude, longitude, and radius.

The conversion follows these equations:
- `radius = √(x² + y² + z²)`
- `latitude = arcsin(z / radius)` (in degrees)
- `longitude = arctan2(y, x)` (in degrees)

## Examples

### Converting ECEF coordinates to spherical

```javascript
// Convert Cartesian coordinates to spherical
const cartesian = [6371, 0, 0]; // Point on the equator at 0° longitude
const spherical = xyz2sph(cartesian);
log(`Spherical coordinates: ${spherical}`);
// Output: Spherical coordinates: [0, 0, 6371]
```

### Working with Vector3 objects

```javascript
// Using with Vector3 objects
const position = new Vector3(0, 6371, 0); // Point on the equator at 90° longitude
const spherical = xyz2sph(position);
log(`Latitude: ${spherical[0]}°, Longitude: ${spherical[1]}°, Radius: ${spherical[2]} km`);
// Output: Latitude: 0°, Longitude: 90°, Radius: 6371 km
```

## Related

- [`sph2xyz`](/dsl/commands/sph2xyz) - Converts spherical to Cartesian coordinates
- [`geo2xyz`](/dsl/commands/geo2xyz) - Converts geographic to Cartesian coordinates
- [`xyz2geo`](/dsl/commands/xyz2geo) - Converts Cartesian to geographic coordinates
