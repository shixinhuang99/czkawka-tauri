import { invoke } from '@tauri-apps/api/core';
import type { PartialSettings } from '~/types';

export const ipc = {
  viewGitHub(): Promise<void> {
    return invoke('view_github');
  },

  setTheme(theme: string): Promise<void> {
    return invoke('set_theme', { theme });
  },

  getPartialSettings(): Promise<PartialSettings> {
    return invoke('get_partial_settings');
  },

  setNumberOfThreads(numberOfThreads: number): Promise<number> {
    return invoke('set_number_of_threads', { numberOfThreads });
  },
};
