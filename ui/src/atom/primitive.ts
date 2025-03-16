import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { RowSelection } from '~/components/data-table';
import {
  Tools,
  getDefaultPlatformSettings,
  getDefaultPreset,
  getDefaultProgress,
} from '~/consts';
import type {
  DuplicateEntry,
  FileEntry,
  FolderEntry,
  PlatformSettings,
  Preset,
  Progress,
  ThemeCfg,
} from '~/types';

export const themeAtom = atom<ThemeCfg>({
  display: '',
  className: '',
});

export const presetsAtom = atomWithStorage<Preset[]>(
  'setting-presets',
  [getDefaultPreset()],
  undefined,
  { getOnInit: true },
);

export const platformSettingsAtom = atom<PlatformSettings>(
  getDefaultPlatformSettings(),
);

export const currentToolAtom = atomWithStorage<string>(
  'currentTool',
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
