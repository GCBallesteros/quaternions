import { commonStyles } from './common.js';

export const cheatsheetStyles = {
  container: `${commonStyles.card} w-[600px] max-h-[90vh] p-0`,
  header: 'flex justify-between items-center p-6 border-b border-neutral-700',
  title: 'text-3xl font-bold text-white m-0',
  closeButton:
    'text-2xl text-neutral-500 hover:text-white hover:bg-neutral-700 w-8 h-8 flex items-center justify-center rounded cursor-pointer',
  content: 'p-6 overflow-y-auto',
  section: 'mb-8',
  sectionTitle: 'text-xl font-semibold text-white mb-4',
  sectionText: 'text-base leading-relaxed mb-4',
  shortcutList: 'grid grid-cols-[20%_80%] gap-4',
  shortcutKeys: 'flex flex-col gap-3',
  shortcutDescriptions: 'flex flex-col gap-3',
  shortcutKey: `${commonStyles.monospace} bg-neutral-700 px-3 py-1.5 rounded text-sm text-white whitespace-nowrap`,
  shortcutDescription: 'text-sm text-neutral-300 py-1.5',
};
