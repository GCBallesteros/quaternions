import { html } from 'lit-html';

import { cheatsheetStyles } from './styles/cheatsheet.js';

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: 'S', description: 'Save current script' },
  { key: 'O', description: 'Browse and open saved scripts' },
  { key: 'Shift + Enter', description: 'Execute current cell' },
  { key: 'Shift + Enter', description: 'Execute entire script' },
  { key: 'ESC', description: 'Close any open modal' },
];

export const cheatsheetTemplate = (isMac: boolean, onClose: () => void) => html`
  <div class=${cheatsheetStyles.header}>
    <h3 class=${cheatsheetStyles.title}>Cheatsheet</h3>
    <button class=${cheatsheetStyles.closeButton} @click=${onClose}>
      &times;
    </button>
  </div>
  <div class=${cheatsheetStyles.content}>
    <div class=${cheatsheetStyles.section}>
      <h2 class=${cheatsheetStyles.sectionTitle}>Keyboard Shortcuts</h2>
      <div class=${cheatsheetStyles.shortcutList}>
        <div class=${cheatsheetStyles.shortcutKeys}>
          ${shortcuts.map(
            (shortcut) => html`
              <span class=${cheatsheetStyles.shortcutKey}>
                ${shortcut.key !== 'Shift + Enter' && shortcut.key !== 'ESC'
                  ? `${isMac ? '⌘' : 'Ctrl'} + ${shortcut.key}`
                  : shortcut.key}
              </span>
            `,
          )}
        </div>
        <div class=${cheatsheetStyles.shortcutDescriptions}>
          ${shortcuts.map(
            (shortcut) => html`
              <span class=${cheatsheetStyles.shortcutDescription}>
                ${shortcut.description}
              </span>
            `,
          )}
        </div>
      </div>
    </div>

    <div class=${cheatsheetStyles.section}>
      <h2 class=${cheatsheetStyles.sectionTitle}>Basic Commands</h2>
      <p class=${cheatsheetStyles.sectionText}>Coming soon...</p>
    </div>
  </div>
`;
