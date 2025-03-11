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
