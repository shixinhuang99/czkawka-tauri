import {
  CURRENT_TOOL_KEY,
  LANGUAGE_KEY,
  Languages,
  SETTINGS_PRESETS_KEY,
  THEME_KEY,
  Theme,
  Tools,
} from '~/consts';
import { isValidTool } from './common';

function getStringifyValue(jsonString: string | null): string | null {
  if (jsonString) {
    try {
      const value = JSON.parse(jsonString);
      if (typeof value === 'string') {
        return value;
      }
    } catch (_) {}
  }
  return null;
}

function getStringValue(jsonString: string | null): string | null {
  if (jsonString) {
    try {
      if (typeof jsonString === 'string') {
        return jsonString;
      }
    } catch (_) {}
  }
  return null;
}

export function migrate() {
  currentToolMigrate();
  settingPresetsMigrate();
  themeMigrate();
  languageMigrate();
}

function currentToolMigrate() {
  const currentTool = getStringifyValue(localStorage.getItem(CURRENT_TOOL_KEY));

  if (!currentTool || !isValidTool(currentTool)) {
    localStorage.setItem(
      CURRENT_TOOL_KEY,
      JSON.stringify(Tools.DuplicateFiles),
    );
  }
}

function settingPresetsMigrate() {
  if (localStorage.getItem(SETTINGS_PRESETS_KEY)) {
    return;
  }

  const OLD_PRESETS_KEY = 'setting-presets';
  const oldValue = localStorage.getItem(OLD_PRESETS_KEY);

  if (oldValue) {
    localStorage.setItem(SETTINGS_PRESETS_KEY, oldValue);
    localStorage.removeItem(OLD_PRESETS_KEY);
  }
}

function themeMigrate() {
  const theme = getStringValue(localStorage.getItem(THEME_KEY));

  if (theme && Object.values<string>(Theme).includes(theme)) {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    return;
  }

  if (getStringifyValue(localStorage.getItem(THEME_KEY))) {
    return;
  }

  localStorage.setItem(THEME_KEY, JSON.stringify(Theme.System));
}

function languageMigrate() {
  const language = getStringValue(localStorage.getItem(LANGUAGE_KEY));

  if (language && Object.values<string>(Languages).includes(language)) {
    localStorage.setItem(LANGUAGE_KEY, JSON.stringify(language));
    return;
  }

  if (getStringifyValue(localStorage.getItem(LANGUAGE_KEY))) {
    return;
  }

  localStorage.setItem(LANGUAGE_KEY, JSON.stringify(Languages.En));
}
