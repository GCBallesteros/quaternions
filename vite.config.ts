import { defineConfig } from "vite";
//import monacoEditorPlugin from 'vite-plugin-monaco-editor';
//import monacoEditorPlugin, { type IMonacoEditorOpts } from 'vite-plugin-monaco-editor'
import monacoEditorEsmPlugin from "vite-plugin-monaco-editor-esm";

export default defineConfig({
  build: {
    target: "esnext",
    rollupOptions: { treeshake: false },
  },
  optimizeDeps: {
    include: ["three"],
  },
  plugins: [monacoEditorEsmPlugin({})],
});
