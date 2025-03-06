# switchCamera

Switches the active camera in the scene to a different perspective.

## Syntax

```javascript
switchCamera(camera)
```

## Parameters

| Parameter | Type                      | Description                           |
|-----------|---------------------------|---------------------------------------|
| `camera`  | `THREE.PerspectiveCamera` | The camera to switch to               |

## Returns

`void` - This function doesn't return a value.

## Description

The `switchCamera` function changes the active camera in the scene, allowing you to view the scene from different perspectives. This is particularly useful for switching between the main scene camera and cameras attached to points or satellites.

## Examples

### Switching to a point's camera

```javascript
// Get a point with a camera attached
const sat = point("sat");
if (sat && sat.camera) {
  // Switch to viewing from that point's camera
  switchCamera(sat.camera);
}
```

### Switching back to the main camera

```javascript
// Switch back to the main scene camera
switchCamera(camera("main"));
```

### Adding a camera to a point and switching to it

```javascript
// Add a camera to a point
point("sat").addCamera({
  orientation: [0, 0, 0, 1],
  fov: 45
});

// Switch to the newly added camera
switchCamera(point("sat").camera);
```

## Related

- [`camera`](/dsl/commands/camera) - Retrieves a camera by name
- [`showSecondaryView`](/dsl/commands/showSecondaryView) - Shows a secondary camera view
- [`hideSecondaryView`](/dsl/commands/hideSecondaryView) - Hides the secondary camera view
