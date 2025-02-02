# Adding Satellites

This workflow demonstrates how to add a satellite to the scene and control its
orientation dynamically. We'll create a satellite that tracks the Moon while
maintaining its attitude control.

## Basic Satellite Setup

Here's a complete example that:
1. Resets the scene
2. Sets a specific date/time
3. Adds a satellite using its NORAD ID
4. Configures it to track the Moon

```javascript
// Reset the scene to start fresh
reset();

// Set a specific date for consistent Moon position
let date = new Date(2025, 1, 20, 10);
setTime(date);

// Add a satellite using its NORAD ID
await addSatellite(
  'hf1a',
  {
    type: 'noradId',
    noradId: '60562', // NORAD ID for the satellite
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.Moon,
    secondaryTargetVector: NamedTargets.Velocity,
  },
);
pauseSimTime();

// See the satellite orbit by running `resumeSimTime()` or
// clicking on the UI
// resumeSimTime();
```

## Understanding the Configuration

The `addSatellite` function takes three main arguments:

1. **Name**: A string identifier for the satellite in the scene
2. **TLE Source**: Either a direct TLE string or a NORAD ID to fetch current data
3. **Orientation Mode**: Controls how the satellite maintains its attitude

### Orientation Modes

The orientation configuration can be either:

- **Fixed**: Uses a constant quaternion orientation
- **Dynamic**: Continuously updates to track specified targets

For dynamic orientation, you specify:

- `primaryBodyVector`: Which body axis to point (`'x'`, `'y'`, or `'z'`)
- `secondaryBodyVector`: Secondary body axis for roll reference
- `primaryTargetVector`: What to point at (Moon, Sun, Nadir, etc.)
- `secondaryTargetVector`: Secondary alignment target

### Available Named Targets

You can use these predefined targets:
- `{ type: 'Moon' }`: Track the Moon
- `{ type: 'Sun' }`: Track the Sun
- `{ type: 'Velocity' }`: Align with orbital velocity
- `{ type: 'Nadir' }`: Point toward Earth's center

## Tips

- Use `pauseSimTime()` and `resumeSimTime()` to control the simulation flow
- The satellite's position updates automatically based on its TLE data
- Dynamic orientation updates happen automatically while time is flowing
- You can have multiple satellites with different tracking configurations
