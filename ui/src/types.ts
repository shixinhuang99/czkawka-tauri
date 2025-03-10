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
  availableThreadNumber: number;
  duplicateImagePreview: boolean;
  duplicateHideHardLinks: boolean;
  duplicateUsePrehash: boolean;
  duplicateMinimalHashCacheSize: number;
  duplicateMinimalPrehashCacheSize: number;
  duplicateDeleteOutdatedEntries: boolean;
  similarImagesHideHardLinks: boolean;
  similarImagesShowImagePreview: boolean;
  similarImagesDeleteOutdatedEntries: boolean;
  similarVideosDeleteOutdatedEntries: boolean;
  similarMusicDeleteOutdatedEntries: boolean;
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
  similarVideosSubIgnoreSameSize: boolean;
  similarVideosSubSimilarity: number;
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

export interface PartialSettings {
  includedDirectories: string[];
  excludedDirectories: string[];
  excludedItems: string;
  availableThreadNumber: number;
}

export interface ToolsCfg {
  current: string;
  inProgress: string;
}
