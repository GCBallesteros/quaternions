# Class: Point

The `Point` class provides basic functionality for positioning a point in 3D space using a `THREE.Group` object.

## Constructor

```typescript
constructor(geometry: THREE.Group)
```

| Parameter  | Type          | Description                                                    |
|------------|---------------|----------------------------------------------------------------|
| `geometry` | `THREE.Group` | A THREE.Group object representing the point in 3D space        |

## Properties

| Property   | Type          | Description                                                                 |
|------------|---------------|-----------------------------------------------------------------------------|
| `geometry` | `THREE.Group` | The underlying Three.js object that stores the point's position and transformations |

## Getters and Setters

### position

```typescript
get position(): Array3
set position(pos: Array3)
```

Gets or sets the point's position in 3D space as a tuple `[x, y, z]`.

### color

```typescript
get color(): string
set color(color: string)
```

Gets or sets the point's color as a hex string (e.g., "#ff0000").

## Methods

### dispose

```typescript
dispose(scene: THREE.Scene): void
```

Removes the point from the scene and disposes of its resources.

| Parameter | Type          | Description                                |
|-----------|---------------|--------------------------------------------|
| `scene`   | `THREE.Scene` | The scene from which to remove the point   |

## Usage

Points are typically created using the [`addPoint`](/dsl/commands/addPoint) function and accessed using the [`point`](/dsl/commands/point) function:

```javascript
// Create a point
addPoint("myPoint", [6371, 0, 0], null, "#ff0000");

// Access the point
const myPoint = point("myPoint");

// Get position
const position = myPoint.position;
log(`Position: ${position}`);

// Change color
myPoint.color = "#00ff00";

// Move the point
myPoint.position = [6371, 1000, 0];
// Or use the mov command
mov("myPoint", [6371, 1000, 0]);
```

