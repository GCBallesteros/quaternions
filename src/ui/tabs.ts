import { render } from 'lit-html';
import * as monaco from 'monaco-editor';

import { tabs, tabsTemplate } from './tabTemplates.js';

export function setupTabs(editor: monaco.editor.IStandaloneCodeEditor): void {
  const tabsContainer = document.querySelector('#tab-container') as HTMLElement;
  if (!tabsContainer) {
    return;
  }

  const handleTabClick = (tabId: string): void => {
    // Update tab contents
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabId}-container`)?.classList.add('active');

    // Trigger Monaco editor resize if editor tab is activated
    if (tabId === 'editor') {
      editor.layout();
    }

    // Update tabs
    updateTabs(tabId);
  };

  const updateTabs = (activeTabId: string) => {
    const updatedTabs = tabs.map((tab) => ({
      ...tab,
      active: tab.id === activeTabId,
    }));

    render(tabsTemplate(updatedTabs, handleTabClick), tabsContainer);
  };

  // Initial render
  updateTabs('editor');
}
