import { Tools } from '~/consts';
import { isValidTool } from './common';

export function migrate() {
  currentToolMigrate();
  settingPresetsMigrate();
}

function currentToolMigrate() {
  const CURRENT_TOOL_KEY = 'currentTool';
  const storedValue = localStorage.getItem(CURRENT_TOOL_KEY);

  if (!storedValue) {
    localStorage.setItem(CURRENT_TOOL_KEY, Tools.DuplicateFiles);
    return;
  }

  if (!isValidTool(storedValue)) {
    localStorage.setItem(CURRENT_TOOL_KEY, Tools.DuplicateFiles);
  }
}

function settingPresetsMigrate() {
  const OLD_PRESETS_KEY = 'setting-presets';
  const NEW_PRESETS_KEY = 'settingPresets';
  const oldValue = localStorage.getItem(OLD_PRESETS_KEY);
  const newValue = localStorage.getItem(NEW_PRESETS_KEY);

  if (newValue) {
    return;
  }

  if (oldValue) {
    localStorage.setItem(NEW_PRESETS_KEY, oldValue);
    localStorage.removeItem(OLD_PRESETS_KEY);
  }
}
