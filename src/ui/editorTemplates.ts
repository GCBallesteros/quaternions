import { html, TemplateResult } from 'lit-html';

export const editorTemplate = (
  modifierKey: string,
  executeScript: () => void,
  executeCell: () => void,
): TemplateResult<1> => html`
  <div id="monaco-editor"></div>
  <div class="execute-buttons">
    <button id="execute-script" @click=${executeScript}>
      Execute Script<br />
      <span class="shortcut">(${modifierKey}+⇧+↵)</span>
    </button>
    <button id="execute-cell" @click=${executeCell}>
      Execute Cell<br />
      <span class="shortcut">(⇧+↵)</span>
    </button>
  </div>
  <div id="output"></div>
`;
