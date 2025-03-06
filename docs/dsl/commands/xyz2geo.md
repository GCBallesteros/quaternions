# xyz2geo

Converts Cartesian coordinates to geographic coordinates.

## Syntax

```javascript
xyz2geo(xyz)
```

## Parameters

| Parameter | Type                | Description                           |
|-----------|---------------------|---------------------------------------|
| `xyz`     | `Array3` or `Vector3` | Cartesian coordinates `[x, y, z]`     |

## Returns

`Array3` - Geographic coordinates as `[latitude, longitude, altitude]` where:
- `latitude` is in degrees (-90° to 90°)
- `longitude` is in degrees (-180° to 180°)
- `altitude` is in kilometers above Earth's surface

## Description

The `xyz2geo` function converts Cartesian (ECEF) coordinates to geographic coordinates. This is similar to `xyz2sph`, but instead of returning the radius, it returns the altitude above Earth's surface.

The conversion first calculates spherical coordinates using `xyz2sph`, then subtracts the Earth's radius from the radius component to get the altitude.

## Examples

### Converting ECEF coordinates to geographic

```javascript
// Convert Cartesian coordinates to geographic
const cartesian = [6371, 0, 0]; // Point on the equator at 0° longitude, at Earth's surface
const geographic = xyz2geo(cartesian);
log(`Geographic coordinates: ${geographic}`);
// Output: Geographic coordinates: [0, 0, 0] (0° latitude, 0° longitude, 0 km altitude)
```

### Working with a point above Earth's surface

```javascript
// Point 500 km above the equator at 0° longitude
const cartesian = [6371 + 500, 0, 0];
const geographic = xyz2geo(cartesian);
log(`Latitude: ${geographic[0]}°, Longitude: ${geographic[1]}°, Altitude: ${geographic[2]} km`);
// Output: Latitude: 0°, Longitude: 0°, Altitude: 500 km
```

## Related

- [`geo2xyz`](/dsl/commands/geo2xyz) - Converts geographic to Cartesian coordinates
- [`xyz2sph`](/dsl/commands/xyz2sph) - Converts Cartesian to spherical coordinates
- [`sph2xyz`](/dsl/commands/sph2xyz) - Converts spherical to Cartesian coordinates
