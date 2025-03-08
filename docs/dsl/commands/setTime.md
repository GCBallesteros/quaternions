# setTime

Sets the current simulation time.

The `setTime` function sets the current simulation time, which affects time-dependent calculations such as satellite positions, Sun and Moon positions, and other time-based visualizations.

**Important:** For consistent results, always use the [`utcDate`](/dsl/commands/utcDate) function to create dates for use with `setTime`.  See [Working with Time](/getting-started/working-with-time) for more details.

Setting the time does not automatically update the positions of satellites in the scene. To update a satellite's position after changing the time, you need to use the satellite's `update` method or recreate the satellite.
TODO

## Syntax

```typescript
setTime(newTime: Date)
```

## Parameters

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `newTime` | `Date` | The new simulation time to set.  Use `utcDate` to create this value. |

## Returns

`void`

## Examples

### Setting the current time

```javascript
// Set the simulation time to the current time (using utcDate for consistency)
setTime(utcDate());
```

### Setting a specific date and time

```javascript
// Set the simulation time to January 1, 2025 at noon UTC
setTime(utcDate(2025, 1, 1, 12, 0, 0));
```

### Using with mov2sat

```javascript
// Set a specific date
const date = utcDate(2025, 1, 1, 12, 0, 0);
setTime(date);

// Move a point to a satellite's position at that time
await mov2sat("sat", "60562", date);
```

## Related

- [Working with Time](/getting-started/working-with-time) - Guidance on consistent time handling.
- [`utcDate`](/dsl/commands/utcDate) - Creates a UTC date object.
- [`pauseSimTime`](/dsl/commands/pauseSimTime) - Pauses the simulation time.
- [`resumeSimTime`](/dsl/commands/resumeSimTime) - Resumes the simulation time.
- [`toggleSimTime`](/dsl/commands/toggleSimTime) - Toggles the simulation time state.
