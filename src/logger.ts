const output = document.getElementById("output");

export function logToOutput(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  output.appendChild(messageElement);
  output.scrollTop = output.scrollHeight; // Scroll to the bottom
}
