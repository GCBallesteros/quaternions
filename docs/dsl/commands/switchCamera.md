# switchCamera

Changes the active camera in the main viewport.


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

This function is not intended for direct use in DSL scripts. It is used internally by other commands.  Here's how it might be used *internally*:

```typescript
// Switch the main view to the camera on the my-satellite point
switchCamera(camera("my-satellite"));
}
```

## Related

- [camera](/dsl/commands/camera) - Retrieves a camera by name.

