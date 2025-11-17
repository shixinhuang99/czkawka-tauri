import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { RowSelection } from '~/components/data-table';
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
  BadFileEntry,
  BrokenEntry,
  DuplicateEntry,
  FileEntry,
  FolderEntry,
  ImagesEntry,
  MusicEntry,
  PlatformSettings,
  Preset,
  Progress,
  SymlinksFileEntry,
  TemporaryFileEntry,
  ToolsValues,
  VideosEntry,
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

export const includedDirsRowSelectionAtom = atom<RowSelection>({});

export const excludedDirsRowSelectionAtom = atom<RowSelection>({});

export const logsAtom = atom<string>('');

export const progressAtom = atom<Progress>(getDefaultProgress());

export const duplicateFilesAtom = atom<DuplicateEntry[]>([]);

export const duplicateFilesRowSelectionAtom = atom<RowSelection>({});

export const emptyFoldersAtom = atom<FolderEntry[]>([]);

export const emptyFoldersRowSelectionAtom = atom<RowSelection>({});

export const bigFilesAtom = atom<FileEntry[]>([]);

export const bigFilesRowSelectionAtom = atom<RowSelection>({});

export const emptyFilesAtom = atom<FileEntry[]>([]);

export const emptyFilesRowSelectionAtom = atom<RowSelection>({});

export const temporaryFilesAtom = atom<TemporaryFileEntry[]>([]);

export const temporaryFilesRowSelectionAtom = atom<RowSelection>({});

export const similarImagesAtom = atom<ImagesEntry[]>([]);

export const similarImagesRowSelectionAtom = atom<RowSelection>({});

export const similarVideosAtom = atom<VideosEntry[]>([]);

export const similarVideosRowSelectionAtom = atom<RowSelection>({});

export const musicDuplicatesAtom = atom<MusicEntry[]>([]);

export const musicDuplicatesRowSelectionAtom = atom<RowSelection>({});

export const invalidSymlinksAtom = atom<SymlinksFileEntry[]>([]);

export const invalidSymlinksRowSelectionAtom = atom<RowSelection>({});

export const brokenFilesAtom = atom<BrokenEntry[]>([]);

export const brokenFilesRowSelectionAtom = atom<RowSelection>({});

export const badExtensionsAtom = atom<BadFileEntry[]>([]);

export const badExtensionsRowSelectionAtom = atom<RowSelection>({});
