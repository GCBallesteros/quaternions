import { defineConfig } from 'vitepress';

export default defineConfig({
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
          { text: 'Overview', link: '/guide1' },
          { text: 'Guide 1', link: '/guide1' },
          { text: 'Guide 2', link: '/guide2' },
          { text: 'Guide 3', link: '/guide3' },
        ],
      },
      {
        text: 'Command Description',
        link: '/api',
      },
      {
        text: 'About',
        link: '/about',
      },
    ],
  },
});
