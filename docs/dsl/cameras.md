# Camera Commands

The app provides functionality to manage multiple cameras in the scene,
including switching between them and attaching cameras to points.

## switchCamera

Switches the active camera in the scene to a different perspective.

| Parameter  | Type                      | Description                           |
|-----------|---------------------------|---------------------------------------|
| `camera`  | `THREE.PerspectiveCamera` | The camera to switch to              |

**Example**:
```js
// Get a point with a camera attached
let point = point("sat");
// Switch to viewing from that point's camera                                              
switchCamera(point.camera);
```

Notes:

- The camera must be a valid THREE.PerspectiveCamera instance
- Typically used in conjunction with points that have cameras attached
- The main scene camera is available as state.cameras.main

### Related Point Methods

Points can have cameras attached to them - see the addCamera method in the
Points documentation for details on how to attach cameras to points.
