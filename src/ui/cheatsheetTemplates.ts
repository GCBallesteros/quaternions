import { html } from 'lit-html';

export const cheatsheetTemplate = (isMac: boolean, onClose: () => void) => html`
  <div class="modal-header">
    <h3 class="modal-title">Cheatsheet</h3>
    <button class="close-button" @click=${onClose}>&times;</button>
  </div>
  <div class="cheatsheet-section">
    <h2>Keyboard Shortcuts</h2>
    <div class="shortcut-list">
      <span class="shortcut-key">${isMac ? '⌘' : 'Ctrl'} + S</span>
      <span class="shortcut-description">Save current script</span>

      <span class="shortcut-key">${isMac ? '⌘' : 'Ctrl'} + O</span>
      <span class="shortcut-description">Browse and open saved scripts</span>

      <span class="shortcut-key">Shift + Enter</span>
      <span class="shortcut-description">Execute current cell</span>

      <span class="shortcut-key">${isMac ? '⌘' : 'Ctrl'} + Shift + Enter</span>
      <span class="shortcut-description">Execute entire script</span>

      <span class="shortcut-key">ESC</span>
      <span class="shortcut-description">Close any open modal</span>
    </div>
  </div>

  <div class="cheatsheet-section">
    <h2>Basic Commands</h2>
    <p>Coming soon...</p>
  </div>
`;
