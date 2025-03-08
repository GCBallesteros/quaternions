# resumeTrail

Resumes drawing the trail for a specified satellite.

The `resumeTrail` function enables the visualization of a satellite's orbital path. It creates or re-attaches a trail to the specified satellite, allowing its trajectory to be displayed over time.

## Syntax

```typescript
resumeTrail(satelliteName: string): void
```

## Parameters

| Parameter     | Description                                                                                                                                                                                                                                                                                                                         |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `satelliteName` | The name of the satellite for which to resume the trail. This must be a satellite that was previously added using `addSatellite`.  If the satellite does not have a camera attached, or if the satellite is not an instance of the `Satellite` class, an error message will be displayed in the console, and no trail will be created. |

## Returns

`void`

## Examples

```javascript
// Resume drawing the trail for the satellite named "mySatellite"
resumeTrail("mySatellite");
```

## Related

- [pauseTrail](/dsl/commands/pauseTrail) - Pauses drawing the trail for a satellite.
- [toggleTrail](/dsl/commands/toggleTrail) - Toggles the trail drawing state for a satellite.
- [addSatellite](/dsl/commands/addSatellite) - Adds a satellite to the scene.
- [Satellite](/dsl/classes/satellite) - The `Satellite` class.
