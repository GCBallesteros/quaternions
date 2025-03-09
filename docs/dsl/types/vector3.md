# Class: Vector3

The `Vector3` class represents a 3D vector with x, y, and z components. It provides various methods for vector operations such as addition, subtraction, scaling, normalization, and quaternion application.

## Constructor

```typescript
constructor(x: number = 0, y: number = 0, z: number = 0)
```

Creates a new Vector3 instance with the specified x, y, and z components. All components default to 0 if not provided.

## Properties

| Property | Type     | Description                  |
|----------|----------|------------------------------|
| `x`      | `number` | The x component of the vector |
| `y`      | `number` | The y component of the vector |
| `z`      | `number` | The z component of the vector |

## Methods

### add

```typescript
add(v: Vector3): Vector3
```

Adds another vector to this vector and returns a new Vector3 instance.

### subtract

```typescript
subtract(v: Vector3): Vector3
```

Subtracts another vector from this vector and returns a new Vector3 instance.

### scale

```typescript
scale(s: number): Vector3
```

Multiplies this vector by a scalar value and returns a new Vector3 instance.

### length

```typescript
length(): number
```

Calculates and returns the length (magnitude) of this vector.

### normalize

```typescript
normalize(): Vector3
```

Returns a new Vector3 instance with the same direction as this vector but with a length of 1. If the vector has zero length, returns a zero vector.

### applyQuaternion

```typescript
applyQuaternion(q: { x: number; y: number; z: number; w: number }): Vector3
```

Applies a quaternion rotation to this vector and returns a new Vector3 instance.

### clone

```typescript
clone(): Vector3
```

Creates and returns a new Vector3 instance with the same x, y, and z values.

### toArray

```typescript
toArray(): [number, number, number]
```

Converts this vector to a 3-element array `[x, y, z]`.

## Usage Examples

### Creating and manipulating vectors

```javascript
// Create a new vector
const position = new Vector3(1, 2, 3);

// Add two vectors
const v1 = new Vector3(1, 0, 0);
const v2 = new Vector3(0, 1, 0);
const v3 = v1.add(v2); // v3 is (1, 1, 0)

// Scale a vector
const scaled = v3.scale(2); // scaled is (2, 2, 0)

// Get the length of a vector
const length = scaled.length(); // length is approximately 2.83

// Normalize a vector
const normalized = scaled.normalize(); // normalized has length 1
```

### Applying quaternion rotations

```javascript
// Create a vector pointing along the x-axis
const vector = new Vector3(1, 0, 0);

// Create a quaternion representing a 90-degree rotation around the z-axis
const quaternion = zyxToQuaternion({ yaw: 90, pitch: 0, roll: 0 });

// Apply the rotation
const rotated = vector.applyQuaternion(quaternion);
// rotated is approximately (0, 1, 0)
```

### Converting between formats

```javascript
// Create a vector
const vector = new Vector3(1, 2, 3);

// Convert to array
const array = vector.toArray(); // array is [1, 2, 3]

// Clone the vector
const clone = vector.clone(); // clone is a new Vector3(1, 2, 3)
```
