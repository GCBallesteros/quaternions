import { logToOutput } from "./logger.js";

export function _help(commands, commandName) {
  if (!commandName) {
    logToOutput(
      "For full docs visit: https://github.com/GCBallesteros/quaternions",
    );
    logToOutput("Available commands:");
    Object.keys(commands).forEach((cmd) => {
      logToOutput(`- ${cmd}`);
    });
    return;
  }

  const command = commands[commandName];
  if (!command || !command.help) {
    logToOutput(`Command '${commandName}' not found.`);
    return;
  }

  logToOutput(`**${commandName}**`);
  logToOutput(command.help.description);
  logToOutput("Arguments:");
  command.help.arguments.forEach((arg) => {
    logToOutput(`- ${arg.name} (${arg.type}): ${arg.description}`);
  });
}
