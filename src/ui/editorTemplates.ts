import { html } from 'lit-html';

export const editorTemplate = (modifierKey: string) => html`
  <div id="monaco-editor"></div>
  <div class="execute-buttons">
    <button id="execute-script">
      Execute Script<br />
      <span class="shortcut">(${modifierKey}+⇧+↵)</span>
    </button>
    <button id="execute-cell">
      Execute Cell<br />
      <span class="shortcut">(⇧+↵)</span>
    </button>
  </div>
  <div id="output"></div>
`;
