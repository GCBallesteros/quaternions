export const settingsStyles = {
  group: 'mb-5',
  groupTitle: 'mt-0 text-blue-500',
  currentTime: 'font-mono',
  button:
    'w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer border-none mt-2',
  switchContainer: 'flex items-center h-[30px] my-4',
  switchLabel: 'ml-3 text-white text-lg whitespace-nowrap -mt-px',
  rangeControl: {
    container: 'mt-4 flex flex-col gap-2',
    header: 'flex justify-between items-center text-white',
    input: `w-full h-1 bg-neutral-700 rounded appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:w-4 
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-none`,
  },
};
