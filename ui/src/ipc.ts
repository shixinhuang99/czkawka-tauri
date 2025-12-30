import { invoke } from '@tauri-apps/api/core';
import type { ImageInfo, PlatformSettings, ScanCmd, Settings } from '~/types';

interface MoveFilesOptions {
  paths: string[];
  destination: string;
  copyMode: boolean;
  preserveStructure: boolean;
  overrideMode: boolean;
}

interface DeleteFilesOptions {
  paths: string[];
  moveDeletedFilesToTrash: boolean;
  isEmptyFoldersTool: boolean;
}

interface SaveResultOptions {
  currentTool: string;
  destination: string;
}

interface RenameExtOptions {
  items: {
    path: string;
    ext: string;
  }[];
}

export interface ConflictInfo {
  included: string;
  excluded: string;
}

export const ipc = {
  getPlatformSettings(): Promise<PlatformSettings> {
    return invoke('get_platform_settings');
  },

  validateScanDirectories(settings: Settings): Promise<string[]> {
    return invoke('validate_scan_directories', { settings });
  },

  checkDirectoryConflict(
    pathToAdd: string,
    targetField: string,
    currentIncluded: string[],
    currentExcluded: string[],
  ): Promise<ConflictInfo | null> {
    return invoke('check_directory_conflict', {
      pathToAdd,
      targetField,
      currentIncluded,
      currentExcluded,
    });
  },

  setupNumberOfThreads(numberOfThreads: number): Promise<number> {
    return invoke('setup_number_of_threads', { numberOfThreads });
  },

  scan(scanCmd: ScanCmd, settings: Settings) {
    return invoke(scanCmd, { settings });
  },

  startListenScanProgress() {
    return invoke('listen_scan_progress');
  },

  stopScan() {
    return invoke('stop_scan');
  },

  readImage(path: string): Promise<ImageInfo> {
    return invoke('read_image', { path });
  },

  moveFiles(options: MoveFilesOptions) {
    return invoke('move_files', { options });
  },

  deleteFiles(options: DeleteFilesOptions) {
    return invoke('delete_files', { options });
  },

  saveResult(options: SaveResultOptions) {
    return invoke('save_result', { options });
  },

  renameExt(options: RenameExtOptions) {
    return invoke('rename_ext', { options });
  },
};
