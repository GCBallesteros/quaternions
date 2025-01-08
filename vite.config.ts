import { defineConfig } from 'vite';
//import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import monacoEditorPlugin, { type IMonacoEditorOpts } from 'vite-plugin-monaco-editor'

export default defineConfig({
    build: {
        target: 'esnext',
        rollupOptions: { treeshake:false }
    },
    optimizeDeps: {
        include: ['three']
    },
    plugins: [
        monacoEditorPlugin.default({
            languageWorkers: ['editorWorkerService', 'json'],
            globalAPI: true,
            customWorkers: [
                {
                    label: 'json',
                    entry: 'monaco-editor/esm/vs/language/json/json.worker'
                },
            ],
        })
        //monacoEditorPlugin({})
    ]
});

