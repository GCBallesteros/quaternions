import { html } from 'lit-html';
import { SavedScript } from '../storage.js';
import { shortcutStyles } from './styles/shortcuts.js';

export const userScriptTemplate = (
  script: SavedScript,
  onDelete: (name: string) => void,
  onSelect: (content: string) => void,
) => html`
  <div
    class=${shortcutStyles.scriptItem}
    @click=${() => onSelect(script.content)}
  >
    <span class=${shortcutStyles.scriptName}>${script.name}</span>
    <div class="flex items-center">
      <span class=${shortcutStyles.scriptDate}>
        ${new Date(script.timestamp).toLocaleString()}
      </span>
      <span
        class=${shortcutStyles.deleteButton}
        title="Delete script"
        @click=${(e: Event) => {
          e.stopPropagation();
          if (confirm(`Delete script "${script.name}"?`)) {
            onDelete(script.name);
          }
        }}
      >
        🗑️
      </span>
    </div>
  </div>
`;

export const exampleScriptTemplate = (
  name: string,
  content: { script: string; docLink: string },
  onSelect: (content: string) => void,
) => html`
  <div
    class=${shortcutStyles.scriptItem}
    @click=${() => onSelect(content.script)}
  >
    <span class=${shortcutStyles.scriptName}>${name}</span>
    <div class="flex items-center gap-3">
      <a
        href=${content.docLink}
        target="_blank"
        class=${shortcutStyles.docsLink}
        @click=${(e: Event) => e.stopPropagation()}
      >
        docs
      </a>
    </div>
  </div>
`;

export const scriptListTemplate = (
  scripts: Record<string, SavedScript>,
  defaultWorkflows: Record<string, { script: string; docLink: string }>,
  onDelete: (name: string) => void,
  onSelect: (content: string) => void,
) => html`
  ${Object.keys(scripts).length > 0
    ? html`
        <h3 class="text-white px-3 pb-3">Your Scripts</h3>
        ${Object.values(scripts)
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((script) => userScriptTemplate(script, onDelete, onSelect))}
      `
    : ''}
  <h3 class="text-white px-3 py-5">Example Scripts</h3>
  ${Object.entries(defaultWorkflows).map(([name, content]) =>
    exampleScriptTemplate(name, content, onSelect),
  )}
`;
