import { html } from 'lit-html';
import { cheatsheetStyles } from './styles/cheatsheet.js';

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
        // AI! Define the shortcuts on a separate dictionary and then use a loop to
        // create them.
        <div class=${cheatsheetStyles.shortcutKeys}>
          <span class=${cheatsheetStyles.shortcutKey}
            >${isMac ? '⌘' : 'Ctrl'} + S</span
          >
          <span class=${cheatsheetStyles.shortcutKey}
            >${isMac ? '⌘' : 'Ctrl'} + O</span
          >
          <span class=${cheatsheetStyles.shortcutKey}>Shift + Enter</span>
          <span class=${cheatsheetStyles.shortcutKey}
            >${isMac ? '⌘' : 'Ctrl'} + Shift + Enter</span
          >
          <span class=${cheatsheetStyles.shortcutKey}>ESC</span>
        </div>
        // AI! Define the shortcuts descriptions on a separate dictionary and then use a loop to
        // create them.
        <div class=${cheatsheetStyles.shortcutDescriptions}>
          <span class=${cheatsheetStyles.shortcutDescription}
            >Save current script</span
          >
          <span class=${cheatsheetStyles.shortcutDescription}
            >Browse and open saved scripts</span
          >
          <span class=${cheatsheetStyles.shortcutDescription}
            >Execute current cell</span
          >
          <span class=${cheatsheetStyles.shortcutDescription}
            >Execute entire script</span
          >
          <span class=${cheatsheetStyles.shortcutDescription}
            >Close any open modal</span
          >
        </div>
      </div>
    </div>

    <div class=${cheatsheetStyles.section}>
      <h2 class=${cheatsheetStyles.sectionTitle}>Basic Commands</h2>
      <p class=${cheatsheetStyles.sectionText}>Coming soon...</p>
    </div>
  </div>
`;
