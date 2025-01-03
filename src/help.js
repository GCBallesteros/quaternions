import { logToOutput } from "./logger.js";


let helpData = {};

async function loadHelpData() {
    try {
        const response = await fetch("./help.json");
        helpData = await response.json();
    } catch (error) {
        console.error("Error loading help data:", error);
    }
}


await loadHelpData();

export function _help(commandName) {
  if (!commandName) {
    logToOutput(
      "For full docs visit: https://github.com/GCBallesteros/quaternions"
    );
    console.log(helpData);
    logToOutput("Available commands:");
    Object.keys(helpData).forEach((cmd) => {
      logToOutput(`- ${cmd}`);
    });
    return;
  }

  const commandHelp = helpData[commandName];
  if (!commandHelp) {
    logToOutput(`Command '${commandName}' not found.`);
    return;
  }

  logToOutput(`**${commandName}**`);
  logToOutput(commandHelp.description);
  logToOutput("Arguments:");
  commandHelp.arguments.forEach((arg) => {
    logToOutput(`- ${arg.name} (${arg.type}): ${arg.description}`);
  });
}