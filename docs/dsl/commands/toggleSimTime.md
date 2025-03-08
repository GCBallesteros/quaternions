# toggleSimTime

Toggles the flow of time in the simulation between paused and running.

The `toggleSimTime` function switches the state of the simulation's time flow. If time is currently running, it pauses it. If time is currently paused, it resumes it.

## Syntax

```typescript
toggleSimTime()
```

## Parameters

None.

## Returns

`void`

## Examples

```javascript
// Toggle the simulation time state
toggleSimTime();
```

## Related

- [pauseSimTime](/dsl/commands/pauseSimTime) - Pauses the flow of time.
- [resumeSimTime](/dsl/commands/resumeSimTime) - Resumes the flow of time.
- [setTime](/dsl/commands/setTime) - Sets the simulation time to a specific value.
- [Working with Time](/getting-started/working-with-time) - Guidance on consistent time handling.
