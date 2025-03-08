# pauseSimTime

Pauses the flow of time in the simulation.

The `pauseSimTime` function stops the continuous update of time-dependent elements within the simulation, such as satellite positions.  When time is paused, these elements will remain fixed at their current state.

## Syntax

```typescript
pauseSimTime()
```

## Parameters

None.

## Returns

`void`

## Examples

```javascript
// Pause the simulation time
pauseSimTime();
```

## Related

- [resumeSimTime](/dsl/commands/resumeSimTime) - Resumes the flow of time.
- [toggleSimTime](/dsl/commands/toggleSimTime) - Toggles the time flow state.
- [setTime](/dsl/commands/setTime) - Sets the simulation time to a specific value.
- [Working with Time](/getting-started/working-with-time) - Guidance on consistent time handling.
