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

Now you could add a new cell at the bottom (docs here) and then run the
following cell

```js
point("hf1a").addCamera(5);
switchCamera(point("hf1a").camera);
```

which will add a camera with a 5 degree field of view and shows what the
satellite is looking at.


### Looking at another satellite!

Here's an example that demonstrates two satellites interacting - one tracking the Moon while being observed by another satellite:

```javascript
// Reset scene and set specific date
reset();
let date = new Date('2025-01-24T12:00:00Z');
setTime(date);

// Add Sentinel-2B with Moon tracking configuration
await addSatellite(
  'sentinel2b',
  {
    type: 'noradId',
    noradId: '42063',
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.Moon,
    secondaryTargetVector: NamedTargets.Velocity,
  },
);

// Add HF1A configured to track Sentinel-2B
await addSatellite(
  'hf1a',
  {
    type: 'noradId',
    noradId: '60562',
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.TargetPointing('sentinel2b'),
    secondaryTargetVector: NamedTargets.Velocity,
  },
);

// Add a camera to HF1A with 30-degree field of view
point("hf1a").addCamera(30);
switchCamera(point("hf1a").camera);

pauseSimTime();
```

This script:
1. Sets up the scene for January 24th, 2025
2. Adds Sentinel-2B configured to track the Moon (like in the previous example)
3. Adds HF1A configured to track Sentinel-2B
4. Adds a wide-angle camera (30° FOV) to HF1A and switches to its view


## Understanding the sattelite configuration

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
- `NamedTargets.Moon`: Track the Moon
- `NamedTargets.Sun`: Track the Sun
- `NamedTargets.Velocity`: Align with orbital velocity
- `NamedTargets.Nadir`: Point toward Earth's center
- `NamedTargets.TargetPointing(<point_name or ECEF coords>)`: Point at an arbitrary location or moving point

### Earth Observation Satellites

Here's a list of some notable Earth observation satellites you can track:

| Satellite    | NORAD ID | Description |
|--------------|----------|-------------|
| Sentinel-2A  | 40697    | Part of the EU's Copernicus program, provides high-resolution optical imaging |
| Sentinel-2B  | 42063    | Twin satellite to Sentinel-2A, together they provide 5-day revisit coverage |
| Sentinel-2C  | 60989    | Next generation Sentinel-2 satellite |
| PRISMA      | 44072    | Italian hyperspectral imaging satellite |
| Landsat 9   | 49260    | Latest in the Landsat series, provides medium-resolution multispectral imagery |


## Tips

- Use `pauseSimTime()` and `resumeSimTime()` to control the simulation flow
- The satellite's position updates automatically based on its TLE data
- Dynamic orientation updates happen automatically while time is flowing
- You can have multiple satellites with different tracking configurations
