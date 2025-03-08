# toggleTrail

Toggles the drawing of the trail for a specified satellite.

The `toggleTrail` function switches the visualization state of a satellite's orbital path. If the trail is currently being drawn, it pauses it. If the trail is currently paused, it resumes it.

## Syntax

```typescript
toggleTrail(satelliteName: string): void
```

## Parameters

| Parameter     | Description                                                                                                                                                                                                                                                                                                                          |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `satelliteName` | The name of the satellite for which to toggle the trail.  This must be a satellite that was previously added using `addSatellite`. If the satellite is not an instance of the `Satellite` class, an error message will be displayed in the console, and no action will be taken regarding the trail. |

## Returns

`void`

## Examples

```javascript
// Toggle the trail drawing state for the satellite named "mySatellite"
toggleTrail("mySatellite");
```

## Related

- [resumeTrail](/dsl/commands/resumeTrail) - Resumes drawing the trail for a satellite.
- [pauseTrail](/dsl/commands/pauseTrail) - Pauses drawing the trail for a satellite.
- [addSatellite](/dsl/commands/addSatellite) - Adds a satellite to the scene.
- [Satellite](/dsl/classes/satellite) - The `Satellite` class.
