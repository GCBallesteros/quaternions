# Class: Point

The `Point` class provides basic functionality for positioning a point in 3D space using a `THREE.Group` object.

::: warning
Points should be created using the [`addPoint`](/dsl/commands/addPoint) function, not by directly instantiating the `Point` class. Manipulating the internal properties directly might lead to inconsistent application state.

Additional methods not documented below are available  like `constructor` and `dispose` that are used by the application but should not be called directly by users.
:::

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

Gets or sets the point's position in ECEF coordinates as a tuple `[x, y, z]`. If
you need to provide your coordinates in other units you might one of the following
as an intermdiate step:
- [`geo2xyz`](/dsl/commands/geo2xyz)
- [`sph2xyz`](/dsl/commands/sph2xyz)

For example:

```javascript
myPoint.position = geo2xyz([30, 40, 100]);
```

### color

```typescript
get color(): string
set color(color: string)
```

Gets or sets the point's color as a hex string (e.g., "#ff0000").

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
