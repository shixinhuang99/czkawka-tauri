import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { getDefaultPreset } from '~/consts';
import type { PartialSettings, Preset, ThemeCfg } from '~/types';

export const themeAtom = atom<ThemeCfg>({
  display: '',
  className: '',
});

export const PresetsAtom = atomWithStorage<Preset[]>(
  'setting-presets',
  [getDefaultPreset()],
  undefined,
  { getOnInit: true },
);

export const PartialSettingsAtom = atom<PartialSettings>({
  includedDirectories: [],
  excludedDirectories: [],
  excludedItems: '',
  availableThreadNumber: 1,
});
