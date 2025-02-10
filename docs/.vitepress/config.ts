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
        text: 'Example Workflows',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/workflows/overview' },
          {
            text: 'Debugging quaternions',
            link: '/workflows/debugging-quaternions',
          },
          {
            text: 'Finding a satellites position',
            link: '/workflows/check-current-position-of-a-satellite',
          },
          {
            text: 'Optimal satellite orientation',
            link: '/workflows/point-nadir-with-y-axis-pointing-north',
          },
          {
            text: 'Adding Satellitess',
            link: '/workflows/adding-satellites',
          },
        ],
      },
      {
        text: 'Command Description',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/dsl/overview' },
          {
            text: 'Point Geometries',
            link: '/dsl/points/overview',
            items: [
              { text: 'Point', link: '/dsl/points/point' },
              { text: 'OrientedPoint', link: '/dsl/points/orientedPoint' },
              { text: 'Satellite', link: '/dsl/points/satellite' },
            ],
          },
          { text: 'Movement & Attitude', link: '/dsl/movement-and-attitude' },
          { text: 'Geometry Commands', link: '/dsl/geometry-commands' },
          { text: 'Utility', link: '/dsl/utility' },
          { text: 'Camera Work', link: '/dsl/cameras' },
        ],
      },
      {
        text: 'About',
        link: '/about',
      },
    ],
  },
});
