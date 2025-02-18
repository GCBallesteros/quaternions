import { commonStyles } from './common.js';

export const plotStyles = {
  container: `${commonStyles.card} ${commonStyles.sectionContainer} relative w-full aspect-[2/1]`,
  canvas: 'absolute inset-0 mt-10 mx-2 mb-2 object-contain',
  header: {
    wrapper:
      'flex justify-between items-center p-1 px-2 bg-neutral-900 absolute top-0 left-0 right-0 z-10',
    id: `${commonStyles.monospace} text-white text-sm`,
    button:
      'bg-blue-600 hover:bg-blue-700 text-white border-none px-2 py-1 rounded text-xs cursor-pointer',
  },
};
