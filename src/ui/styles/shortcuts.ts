import { commonStyles } from './common.js';

export const shortcutStyles = {
  scriptList: 'max-h-[300px] overflow-y-auto mb-4 flex flex-col gap-2',
  scriptItem: `${commonStyles.card} border border-neutral-600 hover:border-blue-600 hover:bg-neutral-700 
               cursor-pointer flex justify-between items-center p-3`,
  scriptName: 'text-sm text-white',
  scriptDate: 'text-xs text-neutral-400',
  deleteButton:
    'text-neutral-500 cursor-pointer p-1 rounded hover:text-red-500 hover:bg-red-500/10 ml-2',
  docsLink: 'text-xs text-blue-500 hover:underline',
};
