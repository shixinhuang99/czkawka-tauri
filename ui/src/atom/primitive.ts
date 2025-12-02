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

export const toolDataAtom = atom<
  Record<ToolsValues, BaseEntry[] | BaseEntry[][]>
>({
  [Tools.DuplicateFiles]: [],
  [Tools.EmptyFolders]: [],
  [Tools.BigFiles]: [],
  [Tools.EmptyFiles]: [],
  [Tools.TemporaryFiles]: [],
  [Tools.SimilarImages]: [],
  [Tools.SimilarVideos]: [],
  [Tools.MusicDuplicates]: [],
  [Tools.InvalidSymlinks]: [],
  [Tools.BrokenFiles]: [],
  [Tools.BadExtensions]: [],
});

export const rowSelectionAtom = atom<Record<ToolsValues, RowSelectionState>>({
  [Tools.DuplicateFiles]: {},
  [Tools.EmptyFolders]: {},
  [Tools.BigFiles]: {},
  [Tools.EmptyFiles]: {},
  [Tools.TemporaryFiles]: {},
  [Tools.SimilarImages]: {},
  [Tools.SimilarVideos]: {},
  [Tools.MusicDuplicates]: {},
  [Tools.InvalidSymlinks]: {},
  [Tools.BrokenFiles]: {},
  [Tools.BadExtensions]: {},
});

export const sortingAtom = atom<Record<ToolsValues, SortingState>>({
  [Tools.DuplicateFiles]: [],
  [Tools.EmptyFolders]: [],
  [Tools.BigFiles]: [],
  [Tools.EmptyFiles]: [],
  [Tools.TemporaryFiles]: [],
  [Tools.SimilarImages]: [],
  [Tools.SimilarVideos]: [],
  [Tools.MusicDuplicates]: [],
  [Tools.InvalidSymlinks]: [],
  [Tools.BrokenFiles]: [],
  [Tools.BadExtensions]: [],
});
