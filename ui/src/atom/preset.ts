import { atom } from 'jotai';
import { toastError } from '~/components';
import { getDefaultPreset } from '~/consts';
import { ipc } from '~/ipc';
import type { Preset } from '~/types';
import { platformSettingsAtom, presetsAtom } from './primitive';

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

export const initPlatformSettingsAtom = atom(null, async (get, set) => {
  try {
    const data = await ipc.getPlatformSettings();
    set(platformSettingsAtom, data);
    const currentPreset = get(currentPresetAtom);
    if (!currentPreset.changed) {
      const threadNumber = await ipc.setupNumberOfThreads(
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
    const threadNumber = await ipc.setupNumberOfThreads(
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
