import type { Tools } from './consts';

type ValueOf<T> = T[keyof T];

export type ToolsValues = ValueOf<typeof Tools>;

export interface Preset {
  name: string;
  active: boolean;
  changed: boolean;
  settings: Settings;
}

export interface Settings {
  includedDirectories: string[];
  includedDirectoriesReferenced: string[];
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
  duplicatesSubCheckMethod: string;
  duplicatesSubAvailableHashType: string;
  duplicatesSubNameCaseSensitive: boolean;

  similarImagesHideHardLinks: boolean;
  similarImagesShowImagePreview: boolean;
  similarImagesDeleteOutdatedEntries: boolean;
  similarImagesSubHashSize: string;
  similarImagesSubHashAlg: string;
  similarImagesSubResizeAlgorithm: string;
  similarImagesSubIgnoreSameSize: boolean;
  similarImagesSubSimilarity: number;

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
  tool: ToolsValues | '';
  stopping: boolean;
  data: ProgressData;
}

export interface ProgressData {
  currentProgress: number;
  allProgress: number;
  stepName: string;
}

export interface BaseEntry<T = { path: string; [key: string]: any }> {
  path: string;
  isRef?: boolean;
  hidden?: boolean;
  groupId?: number;
  rawData: T;
}

export interface RawFileEntry {
  path: string;
  size: number;
  modified_date: number;
}

export interface FileEntry extends BaseEntry<RawFileEntry> {
  size: string;
  fileName: string;
  modifiedDate: string;
}

export interface RawDuplicateEntry {
  path: string;
  modified_date: number;
  size: number;
  hash: string;
}

export interface DuplicateEntry extends BaseEntry<RawDuplicateEntry> {
  size: string;
  fileName: string;
  modifiedDate: string;
  hash: string;
  isImage: boolean;
}

export interface RawFolderOrTemporaryFileEntry {
  path: string;
  modified_date: number;
}

export interface FolderEntry extends BaseEntry<RawFolderOrTemporaryFileEntry> {
  folderName: string;
  modifiedDate: string;
}

export interface TemporaryFileEntry
  extends BaseEntry<RawFolderOrTemporaryFileEntry> {
  fileName: string;
  modifiedDate: string;
}

export interface RawImagesEntry {
  path: string;
  size: number;
  width: number;
  height: number;
  modified_date: number;
  similarity: string;
}

export interface ImagesEntry extends BaseEntry<RawImagesEntry> {
  fileName: string;
  size: string;
  modifiedDate: string;
  similarity: string;
  dimensions: string;
}

export interface RawVideosEntry {
  path: string;
  size: number;
  modified_date: number;
}

export interface VideosEntry extends BaseEntry<RawVideosEntry> {
  fileName: string;
  size: string;
  modifiedDate: string;
}

export interface RawMusicEntry {
  size: number;
  path: string;
  modified_date: number;
  track_title: string;
  track_artist: string;
  year: string;
  length: string;
  genre: string;
  bitrate: number;
}

export interface MusicEntry extends BaseEntry<RawMusicEntry> {
  size: string;
  fileName: string;
  modifiedDate: string;
  trackTitle: string;
  trackArtist: string;
  year: string;
  length: string;
  genre: string;
  bitrate: string;
}

export interface RawSymlinksFileEntry {
  path: string;
  size: number;
  modified_date: number;
  symlink_info: {
    destination_path: string;
    type_of_error: string;
  };
}

export interface SymlinksFileEntry extends BaseEntry<RawSymlinksFileEntry> {
  symlinkName: string;
  modifiedDate: string;
  destinationPath: string;
  typeOfError: string;
  size: string;
}

export interface RawBrokenEntry {
  path: string;
  modified_date: number;
  size: number;
  error_string: string;
}

export interface BrokenEntry extends BaseEntry<RawBrokenEntry> {
  fileName: string;
  modifiedDate: string;
  size: string;
  errorString: string;
}

export interface RawBadFileEntry {
  path: string;
  modified_date: number;
  size: number;
  current_extension: string;
  proper_extensions_group: string;
  proper_extension: string;
}

export interface BadFileEntry extends BaseEntry<RawBadFileEntry> {
  fileName: string;
  modifiedDate: string;
  currentExtension: string;
  properExtensionsGroup: string;
  properExtension: string;
}

interface ScanResult<C extends ScanCmd, L> {
  cmd: C;
  list: L;
  message: string;
}

export type TupleWithRefItem<T> = [T | null, T[]];

export type AllScanResult =
  | ScanResult<'scan_duplicate_files', TupleWithRefItem<RawDuplicateEntry>[]>
  | ScanResult<'scan_empty_folders', RawFolderOrTemporaryFileEntry[]>
  | ScanResult<'scan_big_files', RawFileEntry[]>
  | ScanResult<'scan_empty_files', RawFileEntry[]>
  | ScanResult<'scan_temporary_files', RawFolderOrTemporaryFileEntry[]>
  | ScanResult<'scan_similar_images', TupleWithRefItem<RawImagesEntry>[]>
  | ScanResult<'scan_similar_videos', TupleWithRefItem<RawVideosEntry>[]>
  | ScanResult<'scan_music_duplicates', TupleWithRefItem<RawMusicEntry>[]>
  | ScanResult<'scan_invalid_symlinks', RawSymlinksFileEntry[]>
  | ScanResult<'scan_broken_files', RawBrokenEntry[]>
  | ScanResult<'scan_bad_extensions', RawBadFileEntry[]>;

export interface ImageInfo {
  base64: string;
  mimeType: string;
}
