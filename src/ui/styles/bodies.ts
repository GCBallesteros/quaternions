export const bodyStyles = {
  pointItem: {
    container: 'p-2 my-1 bg-neutral-800 rounded font-mono',
    summary: {
      wrapper: 'flex items-center gap-2 cursor-pointer list-none',
      colorPicker: `w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent 
                    [&::-webkit-color-swatch-wrapper]:p-0 
                    [&::-webkit-color-swatch]:border-neutral-600 
                    [&::-webkit-color-swatch]:rounded`,
      type: 'ml-auto text-sm text-neutral-400'
    },
    details: 'mt-2 ml-5 text-sm text-neutral-400'
  },
  trailToggle: {
    container: 'inline-flex items-center gap-1 ml-3',
    toggle: {
      label: 'inline-flex items-center cursor-pointer',
      input: 'sr-only peer',
      slider: `relative w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer 
               peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
               peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
               after:start-[2px] after:bg-white after:border-neutral-600 after:border 
               after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600`,
      icon: 'text-lg text-blue-500'
    }
  }
};
