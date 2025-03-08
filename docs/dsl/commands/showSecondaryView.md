# showSecondaryView

Displays a secondary viewport showing the view from a specified camera.

The `showSecondaryView` function is used to display a secondary, smaller
viewport within the main application window.  This secondary view renders the
scene from the perspective of the provided camera.  The secondary viewport is
hidden by default and becomes visible when this function is called.

## Syntax

```typescript
showSecondaryView(camera: THREE.PerspectiveCamera): void
```

## Parameters

| Parameter | Description                                                                     |
| --------- | ------------------------------------------------------------------------------- |
| `camera`  | The camera to use for the secondary view. This is usually a satellite's camera. |

## Returns

`void`


## Examples

```javascript
// Assuming "satellite1" is an OrientedPoint with a camera
showSecondaryView(camera("satellite1"));
```

## Related

- [hideSecondaryView](/dsl/commands/hideSecondaryView) - Hides the secondary viewport.
- [camera](/dsl/commands/camera) - Retrieves a camera by name.
