import { html } from 'lit-html';

export const createTimeInput = (currentTime: Date) => html`
  <div class="flex flex-col gap-2.5 mt-2.5">
    <input
      type="date"
      id="sim-date"
      class="p-1 bg-neutral-700 border border-neutral-600 text-white rounded"
      .value=${currentTime.toISOString().split('T')[0]}
    />
    <div class="flex items-center gap-1">
      <input
        type="number"
        id="sim-hours"
        class="w-[50px] p-1 bg-neutral-700 border border-neutral-600 text-white rounded"
        min="0"
        max="23"
        placeholder="HH"
        .value=${currentTime.getUTCHours().toString().padStart(2, '0')}
      />
      <span>:</span>
      <input
        type="number"
        id="sim-minutes"
        class="w-[50px] p-1 bg-neutral-700 border border-neutral-600 text-white rounded"
        min="0"
        max="59"
        placeholder="MM"
        .value=${currentTime.getUTCMinutes().toString().padStart(2, '0')}
      />
      <span>:</span>
      <input
        type="number"
        id="sim-seconds"
        class="w-[50px] p-1 bg-neutral-700 border border-neutral-600 text-white rounded"
        min="0"
        max="59"
        placeholder="SS"
        .value=${currentTime.getUTCSeconds().toString().padStart(2, '0')}
      />
    </div>
  </div>
`;
