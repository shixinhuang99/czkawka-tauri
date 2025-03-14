export interface ThemeCfg {
  display: string;
  className: string;
}

export interface Preset {
  name: string;
  active: boolean;
  changed: boolean;
  settings: Settings;
}

export interface Settings {
  includedDirectories: string[];
  // includedDirectoriesReferenced: string[];
  excludedDirectories: string[];
  excludedItems: string;
  allowedExtensions: string;
  excludedExtensions: string;
  minimumFileSize: number;
  maximumFileSize: number;
  recursiveSearch: boolean;
  useCache: boolean;
  saveAlsoAsJson: boolean;
  moveDeletedFilesToTrash: boolean;
  threadNumber: number;

  duplicateImagePreview: boolean;
  duplicateHideHardLinks: boolean;
  duplicateUsePrehash: boolean;
  duplicateMinimalHashCacheSize: number;
  duplicateMinimalPrehashCacheSize: number;
  duplicateDeleteOutdatedEntries: boolean;

  similarImagesHideHardLinks: boolean;
  similarImagesShowImagePreview: boolean;
  similarImagesDeleteOutdatedEntries: boolean;
  similarImagesSubHashSize: number;
  similarImagesSubHashAlg: string;
  similarImagesSubResizeAlgorithm: string;
  similarImagesSubIgnoreSameSize: boolean;
  similarImagesSubSimilarity: number;

  duplicatesSubCheckMethod: string;
  duplicatesSubAvailableHashType: string;
  duplicatesSubNameCaseSensitive: boolean;

  biggestFilesSubMethod: string;
  biggestFilesSubNumberOfFiles: number;

  similarVideosHideHardLinks: boolean;
  similarVideosDeleteOutdatedEntries: boolean;
  similarVideosSubIgnoreSameSize: boolean;
  similarVideosSubSimilarity: number;

  similarMusicDeleteOutdatedEntries: boolean;
  similarMusicSubAudioCheckType: string;
  similarMusicSubApproximateComparison: boolean;
  similarMusicCompareFingerprintsOnlyWithSimilarTitles: boolean;
  similarMusicSubTitle: boolean;
  similarMusicSubArtist: boolean;
  similarMusicSubYear: boolean;
  similarMusicSubBitrate: boolean;
  similarMusicSubGenre: boolean;
  similarMusicSubLength: boolean;
  similarMusicSubMaximumDifferenceValue: number;
  similarMusicSubMinimalFragmentDurationValue: number;

  brokenFilesSubAudio: boolean;
  brokenFilesSubPdf: boolean;
  brokenFilesSubArchive: boolean;
  brokenFilesSubImage: boolean;
}

export interface PlatformSettings {
  includedDirectories: string[];
  excludedDirectories: string[];
  excludedItems: string;
  availableThreadNumber: number;
  cacheDirPath: string;
}

export type DirsType = Extract<
  keyof Settings,
  'includedDirectories' | 'excludedDirectories'
>;

export type ScanCmd =
  | 'scan_duplicate_files'
  | 'scan_empty_folders'
  | 'scan_big_files'
  | 'scan_empty_files'
  | 'scan_temporary_files'
  | 'scan_similar_images'
  | 'scan_similar_videos'
  | 'scan_music_duplicates'
  | 'scan_invalid_symlinks'
  | 'scan_broken_files'
  | 'scan_bad_extensions';

export interface Progress {
  tool: string;
  stopping: boolean;
  data: ProgressData;
}

export interface ProgressData {
  currentProgress: number;
  allProgress: number;
  stepName: string;
}

export interface RawFileEntry {
  path: string;
  size: number;
  modified_date: number;
}

export interface FileEntry {
  size: string;
  fileName: string;
  path: string;
  modifiedDate: string;
}

export interface ScanResult<T> {
  cmd: ScanCmd;
  list: T[];
  message: string;
}
