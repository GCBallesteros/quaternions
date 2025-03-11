# switchCamera

Changes the active camera in the main viewport.

The provided camera is usually either the global scene camera that can be
retrieved via `camera("main")` or a camera associated with an `OrientedPoint`
or `Satellite`. This can be retrieved either like `camera("my-satellite")` or
directly as `point("my-satellite").camera`.


## Syntax

```typescript
switchCamera(newCamera: THREE.PerspectiveCamera): void
```

## Parameters

| Parameter   | Description                                      |
| ----------- | ------------------------------------------------ |
| `newCamera` | The `THREE.PerspectiveCamera` to set as active. |

## Returns

`void`


## Examples

```typescript
// Switch the main view to the camera on the my-satellite point
switchCamera(camera("my-satellite"));
}
```

## Related

- [camera](/dsl/commands/camera) - Retrieves a camera by name.

