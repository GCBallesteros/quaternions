import { html, TemplateResult } from 'lit-html';

export interface Tab {
  id: string;
  label: string;
  active: boolean;
}

export const tabs: Tab[] = [
  { id: 'editor', label: 'Editor', active: true },
  { id: 'settings', label: 'Settings', active: false },
  { id: 'bodies', label: 'Bodies', active: false },
  { id: 'plots', label: 'Plots', active: false },
];

export const tabsTemplate = (
  tabs: Tab[],
  onTabClick: (tabId: string) => void,
): TemplateResult<1> => html`
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
