# resumeSimTime

Resumes the flow of time in the simulation.

The `resumeSimTime` function restarts the continuous update of time-dependent elements within the simulation, such as satellite positions.  This reverses the effect of `pauseSimTime`.

## Syntax

```typescript
resumeSimTime()
```

## Parameters

None.

## Returns

`void`

## Examples

```javascript
// Resume the simulation time
resumeSimTime();
```

## Related

- [pauseSimTime](/dsl/commands/pauseSimTime) - Pauses the flow of time.
- [toggleSimTime](/dsl/commands/toggleSimTime) - Toggles the time flow state.
