# rad2deg

Converts an angle from radians to degrees.

The `rad2deg` function takes an angle in radians as input and returns the equivalent angle in degrees.

## Syntax

```typescript
rad2deg(radians: number): number
```

## Parameters

| Parameter | Type     | Description                       |
| --------- | -------- | --------------------------------- |
| `radians` | `number` | The angle in radians to convert. |

## Returns

`number`: The equivalent angle in degrees.

## Examples

```javascript
// Convert PI/2 radians to degrees
const degrees = rad2deg(Math.PI / 2); // degrees will be 90
```

## Related

- [deg2rad](/dsl/commands/deg2rad) - Converts an angle from degrees to radians.
