import { invoke, isTauri } from '@tauri-apps/api/core';
import { mockIPC } from '@tauri-apps/api/mocks';
import type { PlatformSettings } from '~/types';

export const ipc = {
  viewGitHub(): Promise<void> {
    return invoke('view_github');
  },

  setTheme(theme: string): Promise<void> {
    return invoke('set_theme', { theme });
  },

  getPlatformSettings(): Promise<PlatformSettings> {
    return invoke('get_platform_settings');
  },

  setNumberOfThreads(numberOfThreads: number): Promise<number> {
    return invoke('set_number_of_threads', { numberOfThreads });
  },
};

export function mockIPCForDev() {
  if (!isTauri()) {
    mockIPC((cmd) => {
      if (cmd === 'get_platform_settings') {
        const data: PlatformSettings = {
          includedDirectories: ['foo'],
          excludedDirectories: [
            'bar',
            'baz',
            'fjiefj',
            'jfiefjiej',
            'sjfie',
            'fjeifj',
          ],
          excludedItems: 'foo,bar,baz',
          availableThreadNumber: 8,
        };
        return Promise.resolve(data);
      }
      if (cmd === 'set_number_of_threads') {
        return Promise.resolve(8);
      }
    });
  }
}
