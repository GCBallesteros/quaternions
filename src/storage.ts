const STORAGE_KEY = 'quaternions_saved_scripts';

export interface SavedScript {
  name: string;
  content: string;
  timestamp: number;
}

export function saveScript(name: string, content: string): void {
  const scripts = getSavedScripts();
  scripts[name] = {
    name,
    content,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
  updateScriptSelector();
}

export function loadScript(name: string): string | null {
  const scripts = getSavedScripts();
  return scripts[name]?.content || null;
}

export function getSavedScripts(): Record<string, SavedScript> {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}

export function updateScriptSelector(): void {
  const selector = document.getElementById(
    'saved-scripts',
  ) as HTMLSelectElement;
  if (!selector) return;

  // Clear existing options except the first one
  while (selector.options.length > 1) {
    selector.remove(1);
  }

  // Add saved scripts as options
  const scripts = getSavedScripts();
  Object.values(scripts)
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((script) => {
      const option = document.createElement('option');
      option.value = script.name;
      option.text = script.name;
      selector.add(option);
    });
}
