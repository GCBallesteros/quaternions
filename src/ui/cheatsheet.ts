import { render } from 'lit-html';

import { cheatsheetTemplate } from './cheatsheetTemplates.js';

export function setupCheatsheet(): void {
  const cheatsheetLink = document.getElementById('cheatsheet-link');
  const cheatsheetModal = document.getElementById('cheatsheet-modal');
  const closeCheatsheet = document.getElementById('close-cheatsheet');
  const cheatsheetContent = document.getElementById('cheatsheet-content');

  if (cheatsheetLink && cheatsheetModal && cheatsheetContent) {
    const handleClose = () => {
      cheatsheetModal.classList.remove('active');
    };

    const isMac = /Mac/.test(navigator.userAgent);
    render(cheatsheetTemplate(isMac, handleClose), cheatsheetContent);

    // Show cheatsheet
    cheatsheetLink.addEventListener('click', (e) => {
      e.preventDefault();
      cheatsheetModal.classList.add('active');
    });

    // Close on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cheatsheetModal.classList.contains('active')) {
        handleClose();
      }
    });
  }
}
