const output = document.getElementById("output");

export function logToOutput(message: string) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  output.appendChild(messageElement);
  output.scrollTop = output.scrollHeight;
}
