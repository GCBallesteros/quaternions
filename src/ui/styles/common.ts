export const commonStyles = {
  // Section layout
  sectionContainer: 'mb-5',

  // Headings
  sectionTitle: 'text-2xl font-semibold text-white mb-4',
  subsectionTitle: 'text-xl font-medium text-white mb-3',

  // Text styles
  monospace: 'font-mono',
  dimmed: 'text-neutral-400',

  // Common containers
  card: 'p-2 my-1 bg-neutral-800 rounded',

  // Common controls
  toggle: {
    container: 'inline-flex items-center gap-1 ml-3',
    label: 'inline-flex items-center cursor-pointer',
    input: 'sr-only peer',
    slider: `relative w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer 
             peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
             peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
             after:start-[2px] after:bg-white after:border-neutral-600 after:border 
             after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600`,
  },
};
