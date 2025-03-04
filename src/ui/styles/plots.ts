import { commonStyles } from './common.js';

export const plotStyles = {
  container: `p-2 my-1 bg-neutral-800 rounded ${commonStyles.sectionContainer} relative w-full aspect-[2/1]`,
  canvas: 'object-contain', // 'absolute inset-0 mt-10 mx-2 mb-2 object-contain',
  header: {
    wrapper:
      'flex justify-between items-center p-1 px-2 bg-neutral-900 relative -top-2 left-0 right-0 z-10 rounded-t-sm -mx-2',
    id: `${commonStyles.monospace} text-white text-sm`,
    button:
      'bg-blue-600 hover:bg-blue-700 text-white border-none px-2 py-1 rounded-sm text-xs cursor-pointer',
  },
};
