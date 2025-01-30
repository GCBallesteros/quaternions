import * as monaco from 'monaco-editor';

export function setupTabs(editor: monaco.editor.IStandaloneCodeEditor): void {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');

      // Update active states
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(`${tabName}-container`)?.classList.add('active');

      // Trigger Monaco editor resize if editor tab is activated
      if (tabName === 'editor') {
        editor.layout();
      }
    });
  });
}
