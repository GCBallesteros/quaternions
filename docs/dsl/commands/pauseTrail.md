# pauseTrail

Pauses drawing the trail for a specified satellite.

The `pauseTrail` function stops the visualization of a satellite's orbital path.  It removes the trail from the specified satellite, hiding its trajectory. The trail is disposed of to free up resources.

## Syntax

```typescript
pauseTrail(satelliteName: string): void
```

## Parameters

| Parameter     | Description                                                                                                                                                                                                                                                                                                                       |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `satelliteName` | The name of the satellite for which to pause the trail. This must be a satellite that was previously added using `addSatellite`. If the satellite is not an instance of the `Satellite` class, an error message will be displayed in the console, and no action will be taken regarding the trail. |

## Returns

`void`

## Examples

```javascript
// Pause drawing the trail for the satellite named "mySatellite"
pauseTrail("mySatellite");
```

## Related

- [resumeTrail](/dsl/commands/resumeTrail) - Resumes drawing the trail for a satellite.
- [toggleTrail](/dsl/commands/toggleTrail) - Toggles the trail drawing state for a satellite.
- [addSatellite](/dsl/commands/addSatellite) - Adds a satellite to the scene.
- [Satellite](/dsl/classes/satellite) - The `Satellite` class.
