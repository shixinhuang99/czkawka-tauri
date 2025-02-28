import { atom } from 'jotai';
import { getDefaultPreset } from '~/consts';
import type { Preset } from '~/types';
import { PresetsAtom } from './primitive';

export const changeCurrentPresetAtom = atom(null, (get, set, name: string) => {
  const presets = get(PresetsAtom);
  set(
    PresetsAtom,
    presets.map((preset) => {
      if (preset.name === name) {
        return { ...preset, active: true };
      }
      return { ...preset, active: false };
    }),
  );
});

export const addPresetAtom = atom(null, (get, set, name: string) => {
  const presets = get(PresetsAtom);
  set(
    PresetsAtom,
    presets
      .map((preset) => {
        return { ...preset, active: false };
      })
      .concat({ ...getDefaultPreset(), name, active: true }),
  );
});

export const removePresetAtom = atom(null, (get, set) => {
  const presets = get(PresetsAtom);
  const newPresets = presets.filter((preset) => !preset.active);
  newPresets[0].active = true;
  set(PresetsAtom, newPresets);
});

export const currentPresetAtom = atom(
  (get) => {
    const presets = get(PresetsAtom);
    return presets.find((preset) => preset.active) || getDefaultPreset();
  },
  (get, set, values: Partial<Preset>) => {
    const presets = get(PresetsAtom);
    set(
      PresetsAtom,
      presets.map((preset) => {
        if (preset.active) {
          return { ...preset, ...values };
        }
        return preset;
      }),
    );
  },
);
