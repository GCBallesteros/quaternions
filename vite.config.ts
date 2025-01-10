import { defineConfig } from 'vite';
import monacoEditorEsmPlugin from 'vite-plugin-monaco-editor-esm';

export default defineConfig({
  build: {
    lib: {
      // NOTE: See note below
      entry: 'index.html',
      formats: ['es'],
    },
    target: 'esnext',
    rollupOptions: {
      output: {
        // NOTE: Enabling module preservation prevents Vite from bundling all modules into a single file.
        // Without this setting, Vite may rename variables (e.g., appending `$1` suffixes) to avoid name collisions
        // during the flattening process. This renaming can break user-provided scripts that rely on the original
        // names of DSL functions. Preserving the module structure ensures that each module retains its original
        // names and prevents unintended conflicts.
        preserveModules: true,
        entryFileNames: '[name].js',
      },
      // NOTE: Treeshaking needs to be disabled since it will eliminate the
      // nominally unused functions that form our DSL.
      treeshake: false,
    },
  },
  optimizeDeps: {
    include: ['three'],
  },
  plugins: [monacoEditorEsmPlugin({})],
});
