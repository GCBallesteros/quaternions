import { logToOutput } from './logger.js';

import { CommandFunction } from './types.js';

import {
    geo2xyz,
    getPositionOfPoint,
    sph2xyz,
    validateName,
    xyz2geo,
    xyz2sph,
} from './utils.js';

function _avoidTreeShaking() {
  console.log({
    getPositionOfPoint,
    validateName,
    xyz2geo,
    xyz2sph,
    geo2xyz,
    sph2xyz,
  });
}
_avoidTreeShaking();

export function buildExecuteCommand(
  commands: Record<string, CommandFunction>,
): (command: string) => void {
  // We need to bring in all the DLS here so that the eval can see them. Same
  // for the imports from utils.js above
  const mov = commands.mov;
  const rot = commands.rot;
  const add_point = commands.add_point;
  const create_line = commands.create_line;
  const angle = commands.angle;
  const rad2deg = commands.rad2deg;
  const deg2rad = commands.deg2rad;
  const fetchTLE = commands.fetchTLE;
  const mov2sat = commands.mov2sat;
  const findBestQuaternion = commands.findBestQuaternion;
  const frame = commands.frame;
  const help = commands.help;
  const reset = commands.reset;

  function executeCommand(command: string): void {
    if (command) {
      try {
        const result = eval(command); // Execute the code
        Promise.resolve(result)
          .then((resolvedValue) => {
            if (resolvedValue !== undefined) {
              logToOutput(`  ${resolvedValue}`);
            }
          })
          .catch((error) => {
            logToOutput(`Error: ${error.message}`);
          });
      } catch (error) {
        logToOutput(`Error: ${error.message}`);
      }
    }
  }
  return executeCommand;
}
