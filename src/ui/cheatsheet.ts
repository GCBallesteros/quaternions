import { render } from 'lit-html';
import { cheatsheetTemplate } from './cheatsheetTemplates.js';

export function setupCheatsheet(): void {
  const cheatsheetLink = document.getElementById('cheatsheet-link');
  const cheatsheetModal = document.getElementById('cheatsheet-modal');
  const closeCheatsheet = document.getElementById('close-cheatsheet');
  const cheatsheetContent = document.getElementById('cheatsheet-content');

  if (
    cheatsheetLink &&
    cheatsheetModal &&
    closeCheatsheet &&
    cheatsheetContent
  ) {
    const isMac = /Mac/.test(navigator.userAgent);
    render(cheatsheetTemplate(isMac), cheatsheetContent);

    // Show cheatsheet
    cheatsheetLink.addEventListener('click', (e) => {
      e.preventDefault();
      cheatsheetModal.classList.add('active');
    });

    // Hide cheatsheet
    closeCheatsheet.addEventListener('click', () => {
      cheatsheetModal.classList.remove('active');
    });

    // Close on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cheatsheetModal.classList.contains('active')) {
        cheatsheetModal.classList.remove('active');
      }
    });
  }
}
