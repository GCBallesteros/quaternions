import { commonStyles } from './common.js';

export const settingsStyles = {
  group: commonStyles.sectionContainer,
  currentTime: commonStyles.monospace,
  button:
    'w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer border-none mt-2',
  switchContainer: 'flex items-center h-[30px] my-4',
  switchLabel: 'ml-3 text-white text-lg whitespace-nowrap -mt-px',
  rangeControl: {
    container: 'mt-4 flex flex-col gap-2',
    header: 'flex justify-between items-center text-white',
    input: 'w-full h-1 bg-neutral-700 rounded appearance-none cursor-pointer',
  },
};
