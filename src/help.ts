import { log } from './logger.js';
import helpData from './assets/help.json' with { type: 'json' };

export function _help(commandName: string): void {
  if (!commandName) {
    log('For full docs visit: https://github.com/GCBallesteros/quaternions');
    log('Available commands:');
    Object.keys(helpData).forEach((cmd) => {
      log(`- ${cmd}`);
    });
    return;
  }

  const commandHelp = helpData[commandName];
  if (!commandHelp) {
    log(`Command '${commandName}' not found.`);
    return;
  }

  log(`**${commandName}**`);
  log(commandHelp.description);
  log('Arguments:');
  commandHelp.arguments.forEach(
    (arg: { name: string; type: string; description: string }) => {
      log(`- ${arg.name} (${arg.type}): ${arg.description}`);
    },
  );
}
