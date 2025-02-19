export const bodyStyles = {
  pointItem: {
    container: 'p-2 my-1 bg-neutral-800 rounded font-mono',
    summary: {
      wrapper: 'flex items-center gap-2 cursor-pointer list-none',
      colorPicker: `w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent 
                    [&::-webkit-color-swatch-wrapper]:p-0 
                    [&::-webkit-color-swatch]:border-neutral-600 
                    [&::-webkit-color-swatch]:rounded`,
      type: 'ml-auto text-sm text-neutral-400',
    },
    details: 'mt-2 ml-5 text-sm text-neutral-400',
  },
};
