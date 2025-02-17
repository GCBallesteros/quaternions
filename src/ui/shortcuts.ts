import * as monaco from 'monaco-editor';
import {
  deleteScript,
  getSavedScripts,
  saveScript,
  SavedScript,
} from '../storage.js';
import { defaultWorkflows } from '../defaultWorkflows.js';

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
        const scriptList = modal.querySelector('.script-list') as HTMLElement;
        const cancelBtn = document.querySelector(
          '#cancel-open',
        ) as HTMLButtonElement;

        // Populate script list
        scriptList.innerHTML = '';

        // User scripts section
        const scripts = getSavedScripts();
        if (Object.keys(scripts).length > 0) {
          const userScriptsTitle = document.createElement('h3');
          userScriptsTitle.textContent = 'Your Scripts';
          userScriptsTitle.style.color = '#fff';
          userScriptsTitle.style.padding = '0 12px 12px';
          scriptList.appendChild(userScriptsTitle);

          Object.values(scripts)
            .sort((a: SavedScript, b: SavedScript) => b.timestamp - a.timestamp)
            .forEach((script) => {
              const item = document.createElement('div');
              item.className = 'script-item';
              item.innerHTML = `
            <span class="script-name">${script.name}</span>
            <div style="display: flex; align-items: center;">
              <span class="script-date">${new Date(script.timestamp).toLocaleString()}</span>
              <span class="delete-script" title="Delete script">🗑️</span>
            </div>
          `;
              const deleteBtn = item.querySelector(
                '.delete-script',
              ) as HTMLElement;
              deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Delete script "${script.name}"?`)) {
                  deleteScript(script.name);
                  scriptList.removeChild(item);
                }
              };

              item.onclick = () => {
                editor.setValue(script.content);
                modal.classList.remove('active');
                cleanup();
              };
              scriptList.appendChild(item);
            });
        }

        // Default workflows section
        const defaultTitle = document.createElement('h3');
        defaultTitle.textContent = 'Example Scripts';
        defaultTitle.style.color = '#fff';
        defaultTitle.style.padding = '20px 12px 12px';
        scriptList.appendChild(defaultTitle);

        Object.entries(defaultWorkflows).forEach(([name, content]) => {
          const item = document.createElement('div');
          item.className = 'script-item';
          item.innerHTML = `
            <span class="script-name">${name}</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <a href="${content.docLink}" target="_blank" class="script-docs">docs</a>
              <span class="script-date">Example</span>
            </div>
          `;

          item.onclick = () => {
            editor.setValue(content);
            modal.classList.remove('active');
            cleanup();
          };
          scriptList.appendChild(item);
        });

        modal.classList.add('active');

        const cleanup = () => {
          cancelBtn.onclick = null;
          window.removeEventListener('keydown', handleKeydown);
          scriptList.innerHTML = '';
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
