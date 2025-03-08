import { render } from 'lit-html';
import * as monaco from 'monaco-editor';

import { defaultWorkflows } from '../defaultWorkflows.js';
import { deleteScript, getSavedScripts, saveScript } from '../storage.js';

import { scriptListTemplate } from './shortcutsTemplates.js';
import { shortcutStyles } from './styles/shortcuts.js';

export function setupGlobalShortcuts(
  editor: monaco.editor.IStandaloneCodeEditor,
): void {
  window.addEventListener(
    'keydown',
    (e) => {
      // Save shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();

        const modal = document.querySelector('#save-dialog') as HTMLElement;
        const input = document.querySelector(
          '#script-name-input',
        ) as HTMLInputElement;
        const confirmBtn = document.querySelector(
          '#confirm-save',
        ) as HTMLButtonElement;
        const cancelBtn = document.querySelector(
          '#cancel-save',
        ) as HTMLButtonElement;

        modal.classList.add('active');
        input.value = '';
        input.focus();

        const cleanup = (): void => {
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
          input.onkeydown = null;
        };

        const handleSave = (): void => {
          const name = input.value.trim();
          if (name) {
            saveScript(name, editor.getValue());
            modal.classList.remove('active');
            cleanup();
          }
        };

        const handleCancel = (): void => {
          modal.classList.remove('active');
          cleanup();
        };

        const handleKeydown = (e: KeyboardEvent): void => {
          if (e.key === 'Enter') {
            handleSave();
          } else if (e.key === 'Escape') {
            handleCancel();
          }
        };

        confirmBtn.onclick = handleSave;
        cancelBtn.onclick = handleCancel;
        input.onkeydown = handleKeydown;
      }

      // Open shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        e.stopPropagation();

        const modal = document.querySelector('#open-dialog') as HTMLElement;
        modal.classList.add('active');

        // Ensure script list container exists
        let scriptList = modal.querySelector('.script-list');
        if (!scriptList) {
          scriptList = document.createElement('div');
          scriptList.className = shortcutStyles.scriptList;
          modal.querySelector('.modal-content')?.appendChild(scriptList);
        } else {
          console.error('Where did script-list go?');
        }

        const cancelBtn = document.querySelector(
          '#cancel-open',
        ) as HTMLButtonElement;

        const renderScriptList = (): void => {
          const scripts = getSavedScripts();
          render(
            scriptListTemplate(
              scripts,
              defaultWorkflows,
              (name: string) => {
                deleteScript(name);
                renderScriptList(); // Re-render after deletion
              },
              (content: string) => {
                editor.setValue(content);
                modal.classList.remove('active');
                cleanup();
              },
            ),
            scriptList as HTMLElement,
          );
        };

        renderScriptList();

        modal.classList.add('active');

        const cleanup = (): void => {
          cancelBtn.onclick = null;
          window.removeEventListener('keydown', handleKeydown);
        };

        const handleCancel = (): void => {
          modal.classList.remove('active');
          cleanup();
        };

        const handleKeydown = (e: KeyboardEvent): void => {
          if (e.key === 'Escape') {
            handleCancel();
          }
        };

        cancelBtn.onclick = handleCancel;
        window.addEventListener('keydown', handleKeydown);
      }
    },
    { capture: true },
  );
}
