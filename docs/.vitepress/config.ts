import { defineConfig } from 'vitepress';

export default defineConfig({
  ignoreDeadLinks: true,
  themeConfig: {
    siteTitle: 'What on Earth?',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/GCBallesteros/quaternions',
      },
    ],
    search: { provider: 'local' },
    sidebar: [
      {
        text: 'Introduction',
        link: '/documentation',
      },
      {
        text: 'Getting Started',
        collapsed: true,
        items: [
          {
            text: 'Working with Time',
            link: '/getting-started/working-with-time',
          },
        ],
      },
      {
        text: 'API Reference',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/dsl/overview' },
          { text: 'API Index', link: '/dsl/api' },
          {
            text: 'Classes',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/dsl/classes/overview' },
              { text: 'Point', link: '/dsl/classes/point' },
              { text: 'OrientedPoint', link: '/dsl/classes/orientedPoint' },
              { text: 'Satellite', link: '/dsl/classes/satellite' },
            ],
          },
          {
            text: 'Interfaces & Types',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/dsl/types/overview' },
              { text: 'CameraConfig', link: '/dsl/types/cameraConfig' },
              { text: 'OrientationMode', link: '/dsl/types/orientationMode' },
              { text: 'NamedTargets', link: '/dsl/types/namedTargets' },
            ],
          },
          {
            text: 'Commands',
            collapsed: true,
            items: [
              // Movement & Positioning
              { text: 'mov', link: '/dsl/commands/mov' },
              { text: 'rot', link: '/dsl/commands/rot' },
              { text: 'relativeRot', link: '/dsl/commands/relativeRot' },
              { text: 'mov2sat', link: '/dsl/commands/mov2sat' },

              // Points & Geometry
              { text: 'addPoint', link: '/dsl/commands/addPoint' },
              { text: 'deletePoint', link: '/dsl/commands/deletePoint' },
              { text: 'listPoints', link: '/dsl/commands/listPoints' },
              { text: 'point', link: '/dsl/commands/point' },
              { text: 'createLine', link: '/dsl/commands/createLine' },
              { text: 'angle', link: '/dsl/commands/angle' },

              // Satellite Operations
              { text: 'addSatellite', link: '/dsl/commands/addSatellite' },
              { text: 'fetchTLE', link: '/dsl/commands/fetchTLE' },
              {
                text: 'findBestQuaternion',
                link: '/dsl/commands/findBestQuaternion',
              },
              { text: 'resumeTrail', link: '/dsl/commands/resumeTrail' },
              { text: 'pauseTrail', link: '/dsl/commands/pauseTrail' },
              { text: 'toggleTrail', link: '/dsl/commands/toggleTrail' },

              // Camera Controls
              { text: 'camera', link: '/dsl/commands/camera' },
              { text: 'switchCamera', link: '/dsl/commands/switchCamera' },
              {
                text: 'showSecondaryView',
                link: '/dsl/commands/showSecondaryView',
              },
              {
                text: 'hideSecondaryView',
                link: '/dsl/commands/hideSecondaryView',
              },

              // Time Controls
              { text: 'setTime', link: '/dsl/commands/setTime' },
              { text: 'pauseSimTime', link: '/dsl/commands/pauseSimTime' },
              { text: 'resumeSimTime', link: '/dsl/commands/resumeSimTime' },
              { text: 'toggleSimTime', link: '/dsl/commands/toggleSimTime' },

              // Plotting & Visualization
              { text: 'createPlot', link: '/dsl/commands/createPlot' },
              { text: 'removePlot', link: '/dsl/commands/removePlot' },

              // Utility Functions
              { text: 'reset', link: '/dsl/commands/reset' },
              { text: 'log', link: '/dsl/commands/log' },
              { text: 'rad2deg', link: '/dsl/commands/rad2deg' },
              { text: 'deg2rad', link: '/dsl/commands/deg2rad' },
              { text: 'geo2xyz', link: '/dsl/commands/geo2xyz' },
              { text: 'xyz2geo', link: '/dsl/commands/xyz2geo' },
              { text: 'sph2xyz', link: '/dsl/commands/sph2xyz' },
              { text: 'xyz2sph', link: '/dsl/commands/xyz2sph' },
              { text: 'utcDate', link: '/dsl/commands/utcDate' },
              {
                text: 'zyxToQuaternion',
                link: '/dsl/commands/zyxToQuaternion',
              },
              { text: 'longRunning', link: '/dsl/commands/longRunning' },
            ],
          },
        ],
      },
      {
        text: 'Workflows',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/workflows/overview' },
          {
            text: 'Debugging quaternions',
            link: '/workflows/debugging-quaternions',
          },
          {
            text: "Finding a satellite's position",
            link: '/workflows/check-current-position-of-a-satellite',
          },
          {
            text: 'Optimal satellite orientation',
            link: '/workflows/point-nadir-with-y-axis-pointing-north',
          },
          {
            text: 'Adding Satellites',
            link: '/workflows/adding-satellites',
          },
        ],
      },
      {
        text: 'About',
        link: '/about',
      },
    ],
  },
});
