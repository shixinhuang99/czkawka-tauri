import type { RowSelectionState, SortingState } from '@tanstack/react-table';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  CURRENT_TOOL_KEY,
  getDefaultPlatformSettings,
  getDefaultPreset,
  getDefaultProgress,
  LANGUAGE_KEY,
  Languages,
  SETTINGS_PRESETS_KEY,
  THEME_KEY,
  Theme,
  Tools,
} from '~/consts';
import type {
  BaseEntry,
  PlatformSettings,
  Preset,
  Progress,
  ToolsValues,
} from '~/types';

export const themeAtom = atomWithStorage<string>(
  THEME_KEY,
  Theme.System,
  undefined,
  { getOnInit: true },
);

export const languageAtom = atomWithStorage<string>(
  LANGUAGE_KEY,
  Languages.En,
  undefined,
  { getOnInit: true },
);

export const presetsAtom = atomWithStorage<Preset[]>(
  SETTINGS_PRESETS_KEY,
  [getDefaultPreset()],
  undefined,
  { getOnInit: true },
);

export const platformSettingsAtom = atom<PlatformSettings>(
  getDefaultPlatformSettings(),
);

export const currentToolAtom = atomWithStorage<ToolsValues>(
  CURRENT_TOOL_KEY,
  Tools.DuplicateFiles,
  undefined,
  { getOnInit: true },
);

export const includedDirsRowSelectionAtom = atom<RowSelectionState>({});
export const includedDirsRowSortingAtom = atom<SortingState>([]);

export const excludedDirsRowSelectionAtom = atom<RowSelectionState>({});
export const excludedDirsRowSortingAtom = atom<SortingState>([]);

export const logsAtom = atom<string>('');

export const progressAtom = atom<Progress>(getDefaultProgress());

function createToolsDefaultValue<T>(
  defaultValue: () => T,
): Record<ToolsValues, T> {
  return Object.fromEntries(
    Object.values(Tools).map((tool) => [tool, defaultValue()]),
  ) as any;
}

export const tableDataAtom = atom<
  Record<ToolsValues, BaseEntry[] | BaseEntry[][]>
>(createToolsDefaultValue(() => []));

export const rowSelectionAtom = atom<Record<ToolsValues, RowSelectionState>>(
  createToolsDefaultValue(() => ({})),
);

export const sortingAtom = atom<Record<ToolsValues, SortingState>>(
  createToolsDefaultValue(() => []),
);

export const filterAtom = atom<Record<ToolsValues, string>>(
  createToolsDefaultValue(() => ''),
);

export const filteredTableDataAtom = atom<
  Record<ToolsValues, BaseEntry[] | BaseEntry[][]>
>(createToolsDefaultValue(() => []));

export const searchInputValueAtom = atom('');
