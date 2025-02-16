import { html } from 'lit-html';

export const createTimeInput = (currentTime: Date) => html`
  <div class="time-input">
    <input
      type="date"
      id="sim-date"
      .value=${currentTime.toISOString().split('T')[0]}
    />
    <div class="time-inputs">
      <input
        type="number"
        id="sim-hours"
        min="0"
        max="23"
        placeholder="HH"
        .value=${currentTime.getUTCHours().toString().padStart(2, '0')}
      />
      <span>:</span>
      <input
        type="number"
        id="sim-minutes"
        min="0"
        max="59"
        placeholder="MM"
        .value=${currentTime.getUTCMinutes().toString().padStart(2, '0')}
      />
      <span>:</span>
      <input
        type="number"
        id="sim-seconds"
        min="0"
        max="59"
        placeholder="SS"
        .value=${currentTime.getUTCSeconds().toString().padStart(2, '0')}
      />
    </div>
  </div>
`;
