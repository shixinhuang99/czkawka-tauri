import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Tools, getDefaultPreset } from '~/consts';
import type {
  FileEntry,
  PlatformSettings,
  Preset,
  ThemeCfg,
  ToolsCfg,
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

export const toolsCfgAtom = atomWithStorage<ToolsCfg>(
  'tools',
  { current: Tools.DuplicateFiles, inProgress: '' },
  undefined,
  { getOnInit: true },
);

export const logsAtom = atom<string>('');

export const bigFilesAtom = atom<FileEntry[]>([]);
