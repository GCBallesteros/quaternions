import { html } from 'lit-html';

export interface Tab {
  id: string;
  label: string;
  active?: boolean;
}

export const tabs: Tab[] = [
  { id: 'editor', label: 'Editor', active: true },
  { id: 'settings', label: 'Settings' },
  { id: 'bodies', label: 'Bodies' },
  { id: 'plots', label: 'Plots' },
];

export const tabsTemplate = (
  tabs: Tab[],
  onTabClick: (tabId: string) => void,
) => html`
  <div id="tabs" class="tabs">
    ${tabs.map(
      (tab) => html`
        <button
          class="tab-button ${tab.active ? 'active' : ''}"
          data-tab="${tab.id}"
          @click=${() => onTabClick(tab.id)}
        >
          ${tab.label}
        </button>
      `,
    )}
  </div>
`;
