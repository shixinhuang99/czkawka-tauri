import {
  CURRENT_TOOL_KEY,
  SETTINGS_PRESETS_KEY,
  THEME_KEY,
  Theme,
  Tools,
} from '~/consts';
import { isValidTool } from './common';

export function migrate() {
  currentToolMigrate();
  settingPresetsMigrate();
  themeMigrate();
}

function currentToolMigrate() {
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
  const oldValue = localStorage.getItem(OLD_PRESETS_KEY);
  const newValue = localStorage.getItem(SETTINGS_PRESETS_KEY);

  if (newValue) {
    return;
  }

  if (oldValue) {
    localStorage.setItem(SETTINGS_PRESETS_KEY, oldValue);
    localStorage.removeItem(OLD_PRESETS_KEY);
  }
}

function themeMigrate() {
  const storedValue = localStorage.getItem(THEME_KEY);

  if (!storedValue) {
    localStorage.setItem(THEME_KEY, Theme.System);
    return;
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    if (
      typeof parsedValue !== 'string' ||
      !Object.values<string>(Theme).includes(parsedValue)
    ) {
      localStorage.setItem(THEME_KEY, Theme.System);
    }
  } catch (_) {
    localStorage.setItem(THEME_KEY, Theme.System);
  }
}
