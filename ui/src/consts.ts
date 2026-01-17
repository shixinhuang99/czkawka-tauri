import type { PlatformSettings, Preset, Progress, Settings } from '~/types';

export const THEME_KEY = 'theme';
export const SETTINGS_PRESETS_KEY = 'settingPresets';
export const CURRENT_TOOL_KEY = 'currentTool';
export const LANGUAGE_KEY = 'language';

export const Theme = {
  Dark: 'dark',
  Light: 'light',
  System: 'system',
} as const;

export const Languages = {
  En: 'en',
  Zh: 'zh',
} as const;

export const DARK_MODE_MEDIA = '(prefers-color-scheme: dark)';

export function getDefaultPreset(): Preset {
  return {
    name: 'Default',
    active: true,
    changed: false,
    settings: getDefaultSettings(),
  };
}

export const MAXIMUM_FILE_SIZE = Math.floor((2 ** 31 - 1) / 1000);

export const BigFilesSearchMode = {
  BiggestFiles: 'BiggestFiles',
  SmallestFiles: 'SmallestFiles',
} as const;

export const SimilarImagesHashAlgorithm = {
  Mean: 'Mean',
  Gradient: 'Gradient',
  BlockHash: 'BlockHash',
  VertGradient: 'VertGradient',
  DoubleGradient: 'DoubleGradient',
  Median: 'Median',
} as const;

export const SimilarImagesResizeAlgorithm = {
  Lanczos3: 'Lanczos3',
  Gaussian: 'Gaussian',
  CatmullRom: 'CatmullRom',
  Triangle: 'Triangle',
  Nearest: 'Nearest',
} as const;

export const DuplicatesCheckMethod = {
  Hash: 'Hash',
  Size: 'Size',
  Name: 'Name',
  SizeAndName: 'SizeAndName',
} as const;

export const DuplicatesAvailableHashType = {
  Blake3: 'Blake3',
  CRC32: 'CRC32',
  XXH3: 'XXH3',
} as const;

export const SimilarMusicAudioCheckType = {
  Tags: 'Tags',
  Fingerprint: 'Fingerprint',
} as const;

export function getDefaultSettings(): Settings {
  return {
    includedDirectories: [],
    includedDirectoriesReferenced: [],
    excludedDirectories: [],
    excludedItems: '',
    allowedExtensions: '',
    excludedExtensions: '',
    minimumFileSize: 16,
    maximumFileSize: MAXIMUM_FILE_SIZE,
    recursiveSearch: true,
    useCache: true,
    saveAlsoAsJson: false,
    moveDeletedFilesToTrash: true,
    threadNumber: 1,

    duplicateImagePreview: true,
    duplicateHideHardLinks: true,
    duplicateUsePrehash: true,
    duplicateMinimalHashCacheSize: 256,
    duplicateMinimalPrehashCacheSize: 256,
    duplicateDeleteOutdatedEntries: true,
    duplicatesSubCheckMethod: DuplicatesCheckMethod.Hash,
    duplicatesSubAvailableHashType: DuplicatesAvailableHashType.Blake3,
    duplicatesSubNameCaseSensitive: false,

    similarImagesHideHardLinks: true,
    similarImagesShowImagePreview: true,
    similarImagesDeleteOutdatedEntries: true,
    similarImagesSubHashSize: '16',
    similarImagesSubHashAlg: SimilarImagesHashAlgorithm.Mean,
    similarImagesSubResizeAlgorithm: SimilarImagesResizeAlgorithm.Lanczos3,
    similarImagesSubIgnoreSameSize: false,
    similarImagesSubSimilarity: 10,

    biggestFilesSubMethod: BigFilesSearchMode.BiggestFiles,
    biggestFilesSubNumberOfFiles: 50,

    similarVideosHideHardLinks: true,
    similarVideosDeleteOutdatedEntries: true,
    similarVideosSubIgnoreSameSize: false,
    similarVideosSubSimilarity: 15,

    similarMusicDeleteOutdatedEntries: true,
    similarMusicSubAudioCheckType: SimilarMusicAudioCheckType.Tags,
    similarMusicSubApproximateComparison: false,
    similarMusicCompareFingerprintsOnlyWithSimilarTitles: false,
    similarMusicSubTitle: true,
    similarMusicSubArtist: true,
    similarMusicSubYear: false,
    similarMusicSubBitrate: false,
    similarMusicSubGenre: false,
    similarMusicSubLength: false,
    similarMusicSubMaximumDifferenceValue: 3,
    similarMusicSubMinimalFragmentDurationValue: 5,

    brokenFilesSubAudio: true,
    brokenFilesSubPdf: false,
    brokenFilesSubArchive: false,
    brokenFilesSubImage: false,
  };
}

export function getDefaultPlatformSettings(): PlatformSettings {
  return {
    includedDirectories: [],
    excludedDirectories: [],
    excludedItems: '',
    availableThreadNumber: 1,
    cacheDirPath: '',
  };
}

export const Tools = {
  DuplicateFiles: 'duplicateFiles',
  EmptyFolders: 'emptyFolders',
  BigFiles: 'bigFiles',
  EmptyFiles: 'emptyFiles',
  TemporaryFiles: 'temporaryFiles',
  SimilarImages: 'similarImages',
  SimilarVideos: 'similarVideos',
  MusicDuplicates: 'musicDuplicates',
  InvalidSymlinks: 'invalidSymlinks',
  BrokenFiles: 'brokenFiles',
  BadExtensions: 'badExtensions',
} as const;

export function getDefaultProgress(): Progress {
  return {
    tool: '',
    stopping: false,
    data: {
      currentProgress: 0,
      allProgress: 0,
      stepName: '',
    },
  };
}

export const HIDDEN_ROW_PREFIX = '__hidden__';
