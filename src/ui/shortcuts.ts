import * as monaco from 'monaco-editor';
import { render } from 'lit-html';
import {
  deleteScript,
  getSavedScripts,
  saveScript,
  SavedScript,
} from '../storage.js';
import { defaultWorkflows } from '../defaultWorkflows.js';
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

        const cleanup = () => {
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
          input.onkeydown = null;
        };

        const handleSave = () => {
          const name = input.value.trim();
          if (name) {
            saveScript(name, editor.getValue());
            modal.classList.remove('active');
            cleanup();
          }
        };

        const handleCancel = () => {
          modal.classList.remove('active');
          cleanup();
        };

        const handleKeydown = (e: KeyboardEvent) => {
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
        let scriptList = modal.querySelector('.script-list') as HTMLElement;
        if (!scriptList) {
          scriptList = document.createElement('div');
          scriptList.className = shortcutStyles.scriptList;
          modal.querySelector('.modal-content')?.appendChild(scriptList);
        }

        const cancelBtn = document.querySelector(
          '#cancel-open',
        ) as HTMLButtonElement;

        const scripts = getSavedScripts();
        render(
          scriptListTemplate(
            scripts,
            defaultWorkflows,
            (name: string) => {
              deleteScript(name);
              // Re-render the list after deletion
              render(
                scriptListTemplate(
                  getSavedScripts(),
                  defaultWorkflows,
                  (n) => deleteScript(n),
                  (content) => {
                    editor.setValue(content);
                    modal.classList.remove('active');
                    cleanup();
                  },
                ),
                scriptList,
              );
            },
            (content: string) => {
              editor.setValue(content);
              modal.classList.remove('active');
              cleanup();
            },
          ),
          scriptList,
        );

        modal.classList.add('active');

        const cleanup = () => {
          cancelBtn.onclick = null;
          window.removeEventListener('keydown', handleKeydown);
        };

        const handleCancel = () => {
          modal.classList.remove('active');
          cleanup();
        };

        const handleKeydown = (e: KeyboardEvent) => {
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
