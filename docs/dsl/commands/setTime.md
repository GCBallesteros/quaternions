# setTime

Sets the current simulation time.

## Syntax

```javascript
setTime(newTime)
```

## Parameters

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `newTime` | `Date` | The new simulation time to set       |

## Returns

`void` - This function doesn't return a value.

## Description

The `setTime` function sets the current simulation time. This affects time-dependent calculations like satellite positions, Sun and Moon positions, and other time-based visualizations.

Setting the time does not automatically update the positions of satellites in the scene. To update a satellite's position after changing the time, you need to use the satellite's `update` method or recreate the satellite.

## Examples

### Setting the current time

```javascript
// Set the simulation time to the current time
setTime(new Date());
```

### Setting a specific date and time

```javascript
// Set the simulation time to January 1, 2025 at noon UTC
setTime(new Date('2025-01-01T12:00:00Z'));
```

### Using with mov2sat

```javascript
// Set a specific date
const date = new Date('2025-01-01T12:00:00Z');
setTime(date);

// Move a point to a satellite's position at that time
await mov2sat("sat", "60562", date);
```

## Related

- [`pauseSimTime`](/dsl/commands/pauseSimTime) - Pauses the simulation time
- [`resumeSimTime`](/dsl/commands/resumeSimTime) - Resumes the simulation time
- [`toggleSimTime`](/dsl/commands/toggleSimTime) - Toggles the simulation time state
