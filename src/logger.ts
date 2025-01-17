const output = document.getElementById('output')!;

export function log(message: string): void {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  output.appendChild(messageElement);
  output.scrollTop = output.scrollHeight;
}
