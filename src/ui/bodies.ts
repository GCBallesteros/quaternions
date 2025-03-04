import { render } from 'lit-html';

import { State } from '../types.js';

import { bodiesTemplate } from './bodiesTemplates.js';

// Track expanded state of points
const expandedPoints = new Set<string>();

// Export for use in core.ts
export function removePointFromUI(pointName: string): void {
  expandedPoints.delete(pointName);
}

export function setupBodiesTab(state: State): void {
  const bodiesContainer = document.getElementById('bodies-container')!;

  function updateBodiesContent() {
    render(bodiesTemplate(state, expandedPoints), bodiesContainer);
  }

  // Initial render
  updateBodiesContent();

  // Setup periodic updates
  setInterval(updateBodiesContent, 250);
}
