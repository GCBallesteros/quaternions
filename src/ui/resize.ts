import * as monaco from 'monaco-editor';
import { WebGLRenderer } from 'three';

import { State } from '../types.js';

export function setupResizer(
  editor: monaco.editor.IStandaloneCodeEditor,
  renderer: WebGLRenderer,
  state: State,
): void {
  const resizer = document.getElementById('resizer')!;
  const canvasContainer = document.getElementById('canvas-container')!;
  const editorContainer = document.getElementById('editor-container')!;

  function resizeCanvas(): void {
    const canvasWidth = canvasContainer.clientWidth;
    const canvasHeight = window.innerHeight;
    renderer.setSize(canvasWidth, canvasHeight, true);
    state.activeCamera.aspect = canvasWidth / canvasHeight;
    state.activeCamera.updateProjectionMatrix();

    editor.layout({
      width: editorContainer.clientWidth,
      height: editorContainer.clientHeight,
    });
  }

  resizer.addEventListener('mousedown', (event) => {
    event.preventDefault();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMove);
    });
  });

  function onMouseMove(event: MouseEvent) {
    const totalWidth = window.innerWidth;
    const leftWidth = event.clientX;
    const rightWidth = totalWidth - leftWidth - resizer.clientWidth;
    canvasContainer.style.width = `${leftWidth}px`;
    const rightPanel = document.getElementById('right-panel');
    if (rightPanel) {
      rightPanel.style.width = `${rightWidth}px`;
    }
    resizeCanvas();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}
