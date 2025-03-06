# geo2xyz

Converts geographic coordinates to Cartesian coordinates.

## Syntax

```javascript
geo2xyz(geo)
```

## Parameters

| Parameter | Type                | Description                                                                 |
|-----------|---------------------|-----------------------------------------------------------------------------|
| `geo`     | `Array3` or `Vector3` | Geographic coordinates `[latitude, longitude, altitude]`                    |

## Returns

`Array3` - Cartesian coordinates as `[x, y, z]`

## Description

The `geo2xyz` function converts geographic coordinates to Cartesian (ECEF) coordinates. This is useful for converting from a latitude, longitude, and altitude format to Earth-Centered Earth-Fixed (ECEF) coordinates.

The conversion first adds the altitude to Earth's radius to get the total radius, then uses `sph2xyz` to convert the resulting spherical coordinates to Cartesian coordinates.

## Examples

### Converting geographic coordinates to ECEF

```javascript
// Convert geographic coordinates to Cartesian
const geographic = [0, 0, 0]; // Equator at 0° longitude, at Earth's surface
const cartesian = geo2xyz(geographic);
log(`Cartesian coordinates: ${cartesian}`);
// Output: Cartesian coordinates: [6371, 0, 0]
```

### Converting a location with altitude

```javascript
// Convert Helsinki's coordinates with altitude to ECEF
const helsinki = [60.17, 24.94, 500]; // Latitude, longitude, 500 km altitude
const helsinkiECEF = geo2xyz(helsinki);
log(`Helsinki ECEF: ${helsinkiECEF}`);
```

## Related

- [`xyz2geo`](/dsl/commands/xyz2geo) - Converts Cartesian to geographic coordinates
- [`sph2xyz`](/dsl/commands/sph2xyz) - Converts spherical to Cartesian coordinates
- [`xyz2sph`](/dsl/commands/xyz2sph) - Converts Cartesian to spherical coordinates
