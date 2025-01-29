export function createTimeInput(): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'time-input';

  // Date input
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'sim-date';

  // Add date validation
  dateInput.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    const date = new Date(input.value);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // Revert to previous valid value
      input.value = input.defaultValue;
    } else {
      // Store new valid value
      input.defaultValue = input.value;
    }
  });

  container.appendChild(dateInput);

  // Time inputs container
  const timeContainer = document.createElement('div');
  timeContainer.className = 'time-inputs';

  // Hours input
  const hoursInput = document.createElement('input');
  hoursInput.type = 'number';
  hoursInput.min = '0';
  hoursInput.max = '23';
  hoursInput.id = 'sim-hours';
  hoursInput.placeholder = 'HH';

  // Minutes input
  const minutesInput = document.createElement('input');
  minutesInput.type = 'number';
  minutesInput.min = '0';
  minutesInput.max = '59';
  minutesInput.id = 'sim-minutes';
  minutesInput.placeholder = 'MM';

  // Seconds input
  const secondsInput = document.createElement('input');
  secondsInput.type = 'number';
  secondsInput.min = '0';
  secondsInput.max = '59';
  secondsInput.id = 'sim-seconds';
  secondsInput.placeholder = 'SS';

  // Add time inputs to container
  timeContainer.appendChild(hoursInput);
  timeContainer.appendChild(document.createTextNode(':'));
  timeContainer.appendChild(minutesInput);
  timeContainer.appendChild(document.createTextNode(':'));
  timeContainer.appendChild(secondsInput);

  container.appendChild(timeContainer);

  // Add update button
  const updateButton = document.createElement('button');
  updateButton.textContent = 'Update Time';
  updateButton.id = 'update-time';
  container.appendChild(updateButton);

  return container;
}
