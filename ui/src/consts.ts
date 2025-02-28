import { isTauri } from '@tauri-apps/api/core';
import type { Preset } from '~/types';

export const IS_MAC = navigator.userAgent.includes('Mac');

export const IS_TAURI = isTauri();

export const IS_TAURI_MAC = IS_TAURI && IS_MAC;

export const Theme = {
  Dark: 'dark',
  Light: 'light',
  System: 'system',
} as const;

export const DARK_MODE_MEDIA = '(prefers-color-scheme: dark)';

export const getDefaultPreset = (): Preset => {
  return {
    name: 'Default',
    active: true,
  };
};
