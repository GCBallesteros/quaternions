let output: HTMLElement | null = null;

export function initLogger(): void {
  output = document.getElementById('output');
}

export function log(message: string): void {
  if (!output) {
    console.warn('Logger not initialized');
    return;
  }
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  output.appendChild(messageElement);
  output.scrollTop = output.scrollHeight;
}
