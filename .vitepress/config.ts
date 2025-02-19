import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Quaternions',
  description: 'Explore quaternions and satellites documentation',
  themeConfig: {
    sidebar: [
      {
        text: 'Getting Started',
        link: '/getting-started',
      },
      {
        text: 'Example Workflows',
        link: '/example-workflows',
      },
      {
        text: 'DSL Documentation',
        link: '/dsl-documentation',
      },
    ],
  },
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: '/style.css', // Reference your custom CSS file
      },
    ],
  ],
});
//
//
//
//
//import { defineConfig } from 'vitepress';
//
//export default defineConfig({
//  title: 'Quaternions',
//  description: 'Explore quaternions and satellites documentation',
//  themeConfig: {
//    sidebar: [
//      {
//        text: 'Getting Started',
//        link: '/getting-started',
//      },
//      {
//        text: 'Example Workflows',
//        link: '/example-workflows',
//      },
//      {
//        text: 'DSL Documentation',
//        link: '/dsl-documentation',
//      },
//    ],
//    editLink: {
//      pattern:
//        'https://github.com/GCBallesteros/quaternions/edit/main/docs/:path',
//      text: 'Edit this page on GitHub',
//    },
//  },
//});
//
//
//import { defineConfig } from 'vitepress';
//
//// https://vitepress.dev/reference/site-config
//export default defineConfig({
//  title: 'What on Earth?',
//  description:
//    'Explore quaternions and satellites from the comfort of your living room',
//  themeConfig: {
//    // https://vitepress.dev/reference/default-theme-config
//    nav: [
//      { text: 'Home', link: '/documentation' },
//      { text: 'Examples', link: '/markdown-examples' },
//    ],
//
//    sidebar: [
//      {
//        text: 'Examples',
//        items: [
//          { text: 'Markdown Examples', link: '/markdown-examples' },
//          { text: 'Runtime API Examples', link: '/api-examples' },
//        ],
//      },
//    ],
//
//    socialLinks: [
//      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
//    ],
//  },
//});
//
