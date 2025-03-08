# showSecondaryView

Displays a secondary viewport showing the view from a specified camera.

The `showSecondaryView` function makes the secondary viewport visible and sets its camera to the provided `THREE.PerspectiveCamera` object. This allows you to see the scene from a different perspective, such as from a satellite's point of view.

## Syntax

```typescript
showSecondaryView(camera: THREE.PerspectiveCamera): void
```

## Parameters

| Parameter | Type                      | Description                                                                 |
| --------- | ------------------------- | --------------------------------------------------------------------------- |
| `camera`  | `THREE.PerspectiveCamera` | The camera to use for the secondary view. This is usually a satellite's camera. |

## Returns

`void`

## Description

The `showSecondaryView` function is used to display a secondary, smaller viewport within the main application window.  This secondary view renders the scene from the perspective of the provided camera.  This is particularly useful for visualizing the view from a satellite or other object in the scene. The secondary viewport is hidden by default and becomes visible when this function is called.

## Examples

```javascript
// Assuming "satellite1" is an OrientedPoint with a camera
showSecondaryView(camera("satellite1"));
```

## Related

- [hideSecondaryView](/dsl/commands/hideSecondaryView) - Hides the secondary viewport.
- [camera](/dsl/commands/camera) - Retrieves a camera by name.
