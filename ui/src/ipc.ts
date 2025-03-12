import { invoke, isTauri } from '@tauri-apps/api/core';
import { mockIPC } from '@tauri-apps/api/mocks';
import type {
  BigFileResult,
  FileEntry,
  PlatformSettings,
  RawFileEntry,
  Settings,
} from '~/types';

export const ipc = {
  getPlatformSettings(): Promise<PlatformSettings> {
    return invoke('get_platform_settings');
  },

  setupNumberOfThreads(numberOfThreads: number): Promise<number> {
    return invoke('setup_number_of_threads', { numberOfThreads });
  },

  async scanBigFiles(settings: Settings): Promise<BigFileResult<FileEntry>> {
    const data: BigFileResult<RawFileEntry> = await invoke('scan_big_files', {
      settings,
    });
    return {
      files: data.files.map((fe) => {
        return {
          size: fe.size.toString(),
          fileName: fe.path.toString(),
          path: fe.path,
          modifiedDate: fe.modifiedDate.toString(),
        };
      }),
      message: data.message,
    };
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
      if (cmd === 'setup_number_of_threads') {
        return Promise.resolve(8);
      }
    });
  }
}
