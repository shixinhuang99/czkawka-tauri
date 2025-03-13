import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Tools, getDefaultPreset, getDefaultProgress } from '~/consts';
import type {
  FileEntry,
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

export const platformSettingsAtom = atom<PlatformSettings>({
  includedDirectories: [],
  excludedDirectories: [],
  excludedItems: '',
  availableThreadNumber: 1,
});

export const currentToolAtom = atomWithStorage<string>(
  'currentTool',
  Tools.DuplicateFiles,
  undefined,
  { getOnInit: true },
);

export const logsAtom = atom<string>('');

export const progressAtom = atom<Progress>(getDefaultProgress());

export const bigFilesAtom = atom<FileEntry[]>([]);
