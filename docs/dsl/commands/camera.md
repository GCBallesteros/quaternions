# camera

Retrieves a camera by name.

The `camera` function retrieves a camera object by its name. It searches both built-in cameras and cameras attached to oriented points.

## Syntax

```typescript
camera(name: string): THREE.Camera | null
```

## Parameters

| Parameter | Description                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| `name`    | The name of the camera to retrieve. This can be a built-in camera or a point name. |

## Returns

`THREE.Camera | null`

The camera object if found or `null` if no camera with the given name is found.

## Examples

### Retrieving a built-in camera

```javascript
// Retrieve the main camera
const mainCam = camera("main");
```

### Retrieving a camera attached to a point

```javascript
// Assuming "satellite1" is an OrientedPoint with a camera
const satCam = camera("satellite1");
```

## Related

- [addSatellite](/dsl/commands/addSatellite) - Adds a new satellite with an optional camera.
