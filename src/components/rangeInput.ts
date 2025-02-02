export function createRangeInput(
  label: string,
  id: string,
  min: string,
  max: string,
  step: string,
  value: string,
  onChange: (value: number) => void,
): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'range-control';

  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  container.appendChild(labelElement);

  const input = document.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;

  input.addEventListener('input', () => {
    onChange(parseFloat(input.value));
  });

  container.appendChild(input);

  return container;
}
