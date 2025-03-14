import { defineConfig } from 'vite';
import monacoEditorEsmPlugin from 'vite-plugin-monaco-editor-esm';
import tailwindcss from '@tailwindcss/vite';
import eslint from 'vite-plugin-eslint';

// IMPORTANT: This configuration ensures that `terminal.ts` is kept separate
// from the rest of the application code during the build and bundling process.
// This prevents unintended variable renaming or conflicts. This is crucial
// when working with user-provided scripts that rely on specific function names
// (such as DSL functions), as Vite's default bundling process may otherwise
// rename variables (e.g., appending `$1` suffixes) to avoid name collisions.

// The rest of the application code is placed in `app.js`, and external
// dependencies (such as libraries from `node_modules`) are bundled into
// `vendor.js`. This structure preserves the original module names and ensures
// compatibility with external scripts and the use of custom DSL functions.

export default defineConfig({
  build: {
    lib: {
      entry: 'index.html',
      formats: ['es'],
    },
    minify: false,
    target: 'esnext',
    rollupOptions: {
      output: {
        // Ensure that the `main.js` output is isolated from other chunks
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        manualChunks(id) {
          // Keep `main.ts` isolated in `main.js`
          if (id.includes('src/terminal.ts')) {
            return 'terminal'; // `main.ts` goes into `main.js`
          }

          // All other code in `src/` goes into `app.js`
          if (id.includes('src/')) {
            return 'app'; // Non-main code goes into `app.js`
          }

          // External dependencies go into `vendor.js`
          if (id.includes('node_modules')) {
            return 'vendor'; // Vendor chunk
          }
        },
      },
      treeshake: true,
    },
  },
  optimizeDeps: {
    include: ['three'], // Include necessary dependencies
  },
  plugins: [
    monacoEditorEsmPlugin({}),
    tailwindcss(),
    //eslint({
    //  include: ['src/**/*.ts', 'src/**/*.tsx'],
    //  exclude: ['**/node_modules/**', 'dist/**'],
    //  cache: false,
    //}),
  ],
});
