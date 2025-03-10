import { atom } from 'jotai';
import { toastError } from '~/components';
import { getDefaultPreset, getDefaultSettings } from '~/consts';
import { ipc } from '~/ipc';
import type { Preset } from '~/types';
import { partialSettingsAtom, presetsAtom } from './primitive';

export const changeCurrentPresetAtom = atom(null, (get, set, name: string) => {
  const presets = get(presetsAtom);
  set(
    presetsAtom,
    presets.map((preset) => {
      if (preset.name === name) {
        return { ...preset, active: true };
      }
      return { ...preset, active: false };
    }),
  );
});

export const addPresetAtom = atom(null, (get, set, name: string) => {
  const presets = get(presetsAtom);
  set(
    presetsAtom,
    presets
      .map((preset) => {
        return { ...preset, active: false };
      })
      .concat({ ...getDefaultPreset(), name, active: true }),
  );
});

export const removePresetAtom = atom(null, (get, set) => {
  const presets = get(presetsAtom);
  const newPresets = presets.filter((preset) => !preset.active);
  newPresets[0].active = true;
  set(presetsAtom, newPresets);
});

export const currentPresetAtom = atom(
  (get) => {
    const presets = get(presetsAtom);
    return presets.find((preset) => preset.active) || getDefaultPreset();
  },
  (get, set, values: Partial<Preset>) => {
    const presets = get(presetsAtom);
    set(
      presetsAtom,
      presets.map((preset) => {
        if (preset.active) {
          return { ...preset, ...values, changed: true };
        }
        return preset;
      }),
    );
  },
);

export const initPartialSettingsAtom = atom(null, async (get, set) => {
  try {
    const data = await ipc.getPartialSettings();
    set(partialSettingsAtom, data);
    const currentPreset = get(currentPresetAtom);
    if (!currentPreset.changed) {
      const threadNumber = await ipc.setNumberOfThreads(
        data.availableThreadNumber,
      );
      set(currentPresetAtom, {
        settings: {
          ...currentPreset.settings,
          ...data,
          threadNumber,
        },
        changed: true,
      });
      return;
    }
    const threadNumber = await ipc.setNumberOfThreads(
      currentPreset.settings.threadNumber,
    );
    set(currentPresetAtom, {
      settings: {
        ...currentPreset.settings,
        threadNumber,
        availableThreadNumber: data.availableThreadNumber,
      },
      changed: true,
    });
  } catch (error) {
    toastError('Failed to load settings', error);
  }
});

export const resetSettingsAtom = atom(null, (get, set) => {
  const partialSettings = get(partialSettingsAtom);
  set(currentPresetAtom, {
    settings: {
      ...getDefaultSettings(),
      ...partialSettings,
      threadNumber: partialSettings.availableThreadNumber,
    },
  });
});
