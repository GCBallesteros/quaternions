import * as monaco from 'monaco-editor';
import { WebGLRenderer } from 'three';
import { State } from './types.js';
import { createTimeInput } from './components/timeInput.js';
import { createRangeInput } from './components/rangeInput.js';

// Update current time display
export function updateTimeDisplay(state: State) {
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = state.currentTime.toLocaleString();
  }
}

export function setupUI(
  state: State,
  executeCommand: (command: string) => void,
  renderer: WebGLRenderer,
): void {
  // Setup tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  let editor: monaco.editor.IStandaloneCodeEditor;

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');

      // Update active states
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(`${tabName}-container`)?.classList.add('active');

      // Trigger Monaco editor resize if editor tab is activated
      if (tabName === 'editor') {
        editor.layout();
      }
    });
  });

  // Setup sun light toggle
  const sunToggle = document.getElementById('sun-toggle') as HTMLInputElement;
  sunToggle.addEventListener('change', () => {
    state.lights.sun.visible = sunToggle.checked;
  });

  // Setup ambient light intensity control
  const rangeInput = createRangeInput(
    'Ambient Light',
    'ambient-intensity',
    '0',
    '1',
    '0.05',
    '0.2',
    (value: number) => {
      state.lights.ambient.intensity = value;
    },
  );
  const lightingGroup = document.querySelector('.settings-group:nth-child(2)');
  if (lightingGroup) {
    lightingGroup.appendChild(rangeInput);
  }

  // Setup time input
  const timeGroup = document.querySelector('.settings-group')!;
  const timeInput = createTimeInput();
  timeGroup.appendChild(timeInput);

  // Initialize with current simulation time
  const dateInput = document.getElementById('sim-date') as HTMLInputElement;
  const hoursInput = document.getElementById('sim-hours') as HTMLInputElement;
  const minutesInput = document.getElementById(
    'sim-minutes',
  ) as HTMLInputElement;
  const secondsInput = document.getElementById(
    'sim-seconds',
  ) as HTMLInputElement;

  const currentTime = state.currentTime;
  dateInput.value = currentTime.toISOString().split('T')[0];
  hoursInput.value = currentTime.getHours().toString().padStart(2, '0');
  minutesInput.value = currentTime.getMinutes().toString().padStart(2, '0');
  secondsInput.value = currentTime.getSeconds().toString().padStart(2, '0');

  // Setup update button
  const updateButton = document.getElementById('update-time');
  updateButton?.addEventListener('click', () => {
    const newDate = new Date(dateInput.value);
    newDate.setHours(
      parseInt(hoursInput.value),
      parseInt(minutesInput.value),
      parseInt(secondsInput.value),
    );
    executeCommand(`setTime(new Date("${newDate.toISOString()}"))`);
  });

  function highlightCells(editor: monaco.editor.IStandaloneCodeEditor) {
    const model = editor.getModel();
    if (!model) return;

    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
    const lines = model.getLinesContent();

    lines.forEach((line, index) => {
      if (line.trim().startsWith('// %%')) {
        decorations.push({
          range: new monaco.Range(index + 1, 1, index + 1, line.length + 1),
          options: {
            isWholeLine: true,
            className: 'cell-divider',
          },
        });
      }
    });

    editor.deltaDecorations([], decorations);
  }

  function getCurrentCell(editor: monaco.editor.IStandaloneCodeEditor): string {
    const model = editor.getModel();
    if (!model) return '';

    const position = editor.getPosition();
    if (!position) return '';

    const lines = model.getLinesContent();
    let currentCell: string[] = [];

    // Search backwards for cell boundary or start of file
    for (let i = position.lineNumber - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('// %%')) break;
      currentCell.unshift(lines[i]);
    }

    // Search forwards for cell boundary or end of file
    for (let i = position.lineNumber; i < lines.length; i++) {
      if (lines[i].trim().startsWith('// %%')) break;
      currentCell.push(lines[i]);
    }

    return currentCell.join('\n');
  }

  // Setup editor
  editor = monaco.editor.create(
    document.getElementById('monaco-editor') as HTMLElement,
    {
      value: satelliteScript,
      language: 'javascript',
      theme: 'vs-dark',
      minimap: { enabled: false },
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden',
      },
    },
  );

  // Setup cell highlighting
  editor.onDidChangeModelContent(() => highlightCells(editor));
  // Initial highlight
  highlightCells(editor);

  // Detect platform for keyboard shortcuts
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  const executeScriptButton = document.getElementById('execute-script')!;
  executeScriptButton.innerHTML = `Execute Script<br><span class="shortcut">(${modifierKey}+⇧+↵)</span>`;
  executeScriptButton.addEventListener('click', () => {
    executeCommand(editor.getValue().trim());
  });

  const executeCellButton = document.getElementById('execute-cell')!;
  executeCellButton.innerHTML = `Execute Cell<br><span class="shortcut">(⇧+↵)</span>`;
  executeCellButton.addEventListener('click', () => {
    const cellContent = getCurrentCell(editor);
    executeCommand(cellContent.trim());
  });

  // Add keyboard shortcuts
  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
    const cellContent = getCurrentCell(editor);
    executeCommand(cellContent.trim());
  });

  editor.addCommand(
    (isMac ? monaco.KeyMod.WinCtrl : monaco.KeyMod.CtrlCmd) |
      monaco.KeyMod.Shift |
      monaco.KeyCode.Enter,
    () => {
      executeCommand(editor.getValue().trim());
    },
  );

  // Setup resizer
  const resizer = document.getElementById('resizer')!;
  const canvasContainer = document.getElementById('canvas-container')!;
  const editorContainer = document.getElementById('editor-container')!;

  function resizeCanvas(): void {
    const canvasWidth = canvasContainer.clientWidth;
    const canvasHeight = window.innerHeight;
    renderer.setSize(canvasWidth, canvasHeight, true);
    state.cameras.main.aspect = canvasWidth / canvasHeight;
    state.cameras.main.updateProjectionMatrix();

    // Adjust Monaco Editor size
    editor.layout({
      width: editorContainer.clientWidth,
      height: editorContainer.clientHeight,
    });
  }

  resizer.addEventListener('mousedown', (event) => {
    event.preventDefault();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMove);
    });
  });

  function onMouseMove(event: MouseEvent) {
    const totalWidth = window.innerWidth;
    const leftWidth = event.clientX;
    const rightWidth = totalWidth - leftWidth - resizer.clientWidth;
    canvasContainer.style.width = `${leftWidth}px`;
    const rightPanel = document.getElementById('right-panel');
    if (rightPanel) {
      rightPanel.style.width = `${rightWidth}px`;
    }
    resizeCanvas();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

const satelliteScript = `// %% Reset
// Reset scene so that we can hit execute repeatedly
// on this sample script without errors
reset();

// %% Setup simulation parameters
const target_coords_ecef = geo2xyz([60.186, 24.828, 0]);
const satellite_location_geo = [62.0, 34.0, 500.0];
// quaternions are in xyzw order
const satellite_bad_quat = [
    -0.6313439,
    -0.1346824,
    -0.6313439,
    -0.4297329
];

// Move the default point, 'sat', to somewhere somewhat near Helsinki
mov("sat", satellite_location_geo, true);
// Add a point over the previously calculated coords
addPoint("KS", target_coords_ecef);
// Connect "sat" to new point
createLine("sat2KS", "sat", "KS");
// Rotate 'sat' to buggy quaternion
rot("sat", satellite_bad_quat);

// %% Calculate pointing error
// Calculate angle between z-axis of 'sat' and 'sat2KS'
let angle_between_pointing_and_target = angle(
     "sat2KS", point("sat").frame.z
);
log(angle_between_pointing_and_target);

// Uncomment the code below to fix the orientation of the satellite
// and watch the scene from its point of view.

// // Add a camera wit a FOV of 50 degrees and switch to the satellite camera
// point("sat").addCamera(50);
// switchCamera(point("sat").camera);
// // Point camera at the target
// let good_quat = findBestQuaternion(
//     point("sat").cameraBodyDirection,
//     "y",
//     "sat->KS",
//     [0,0,1]
// );
// rot("sat", good_quat);
`;
