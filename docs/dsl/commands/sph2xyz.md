# sph2xyz

Converts spherical coordinates to Cartesian coordinates.

## Syntax

```javascript
sph2xyz(spherical)
```

## Parameters

| Parameter   | Type                | Description                                                                 |
|-------------|---------------------|-----------------------------------------------------------------------------|
| `spherical` | `Array3` or `Vector3` | Spherical coordinates `[latitude, longitude, radius]`                       |

## Returns

`Array3` - Cartesian coordinates as `[x, y, z]`

## Description

The `sph2xyz` function converts spherical coordinates to Cartesian (ECEF) coordinates. This is useful for converting from a latitude, longitude, and radius format to Earth-Centered Earth-Fixed (ECEF) coordinates.

The conversion follows these equations:
- `x = radius * cos(latitude) * cos(longitude)`
- `y = radius * cos(latitude) * sin(longitude)`
- `z = radius * sin(latitude)`

Where latitude and longitude are in degrees.

## Examples

### Converting spherical coordinates to ECEF

```javascript
// Convert spherical coordinates to Cartesian
const spherical = [0, 0, 6371]; // Equator at 0° longitude, Earth radius
const cartesian = sph2xyz(spherical);
log(`Cartesian coordinates: ${cartesian}`);
// Output: Cartesian coordinates: [6371, 0, 0]
```

### Converting a specific location

```javascript
// Convert Helsinki's coordinates to ECEF
const helsinki = [60.17, 24.94, 6371]; // Latitude, longitude, radius
const helsinkiECEF = sph2xyz(helsinki);
log(`Helsinki ECEF: ${helsinkiECEF}`);
```

## Related

- [`xyz2sph`](/dsl/commands/xyz2sph) - Converts Cartesian to spherical coordinates
- [`geo2xyz`](/dsl/commands/geo2xyz) - Converts geographic to Cartesian coordinates
- [`xyz2geo`](/dsl/commands/xyz2geo) - Converts Cartesian to geographic coordinates
