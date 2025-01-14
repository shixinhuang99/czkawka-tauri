import { invoke } from '@tauri-apps/api/core';

export const ipc = {
  viewGitHub(): Promise<void> {
    return invoke('view_github');
  },

  setTheme(theme: string): Promise<void> {
    return invoke('set_theme', { theme });
  },
};
