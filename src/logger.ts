// We are not using lit-html here for performance and simplicity
import { STYLES } from './logger/styles.js';
import { createExpandableElement } from './logger/expandableElement.js';
import type { LogContainer } from './logger/types.js';

let output: HTMLElement | null = null;

export function initLogger(): void {
  output = document.getElementById('output');
}

function logToDiv(logDivId: string, ...args: any[]): void {
  const logContainer = document.getElementById(logDivId) as LogContainer;
  if (!logContainer) {
    console.warn(`Log container with ID '${logDivId}' not found.`);
    return;
  }

  logContainer.style.cssText = STYLES.logContainer;

  const logEntry = document.createElement('div');
  args.forEach((arg) => {
    logEntry.appendChild(createExpandableElement(arg));
    logEntry.appendChild(document.createElement('br'));
  });

  logContainer.appendChild(logEntry);
}

export function log(message: string): void {
  if (!output) {
    console.warn('Logger not initialized');
    return;
  }
  logToDiv('output', message);
}
