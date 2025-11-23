import { format } from 'date-fns';
import { filesize } from 'filesize';
import type { RowSelection } from '~/components/data-table';
import { Tools } from '~/consts';
import type {
  BadFileEntry,
  BaseEntry,
  BrokenEntry,
  DuplicateEntry,
  FileEntry,
  FolderEntry,
  ImagesEntry,
  MusicEntry,
  RawBadFileEntry,
  RawBrokenEntry,
  RawDuplicateEntry,
  RawFileEntry,
  RawFolderOrTemporaryFileEntry,
  RawImagesEntry,
  RawMusicEntry,
  RawSymlinksFileEntry,
  RawVideosEntry,
  RefEntry,
  SymlinksFileEntry,
  TemporaryFileEntry,
  ToolsValues,
  TupleWithRefItem,
  VideosEntry,
} from '~/types';

const HIDDEN_ROW_PREFIX = '__hidden__';

export function splitStr(s: string): string[] {
  return s
    .replace(/[\u2068\u2069]/g, '')
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function getRowSelectionKeys(rowSelection: RowSelection): string[] {
  const keys: string[] = [];
  for (const kv of Object.entries(rowSelection)) {
    if (kv[1] && !kv[0].startsWith(HIDDEN_ROW_PREFIX)) {
      keys.push(kv[0]);
    }
  }
  return keys;
}

export function getPathsFromEntries<T extends BaseEntry & Partial<RefEntry>>(
  list: T[],
): string[] {
  const paths: string[] = [];
  for (const item of list) {
    if (item.isRef || item.hidden) {
      continue;
    }
    paths.push(item.path);
  }
  return paths;
}

const toolSet = new Set<string>(Object.values(Tools));

export function isValidTool(s: string): s is ToolsValues {
  return toolSet.has(s);
}

function fmtFileSize(v: number): string {
  return filesize(v, { standard: 'si' }).toUpperCase();
}

function pathBaseName(path: string): string {
  const normalizedPath = path.replace(/\\/g, '/');
  const match = normalizedPath.match(/([^/]+)\/?$/);
  return match ? match[1] : '';
}

function fmtDate(v: number): string {
  return format(v * 1000, 'yyyy/MM/dd HH:mm:ss');
}

function isImage(fileName: string): boolean {
  const imageExtensions = [
    'bmp',
    'gif',
    'icns',
    'ico',
    'jpeg',
    'jpg',
    'svg',
    'png',
    'webp',
  ];
  const ext = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();
  return imageExtensions.includes(ext);
}

function sortTupleWithRefItemList<T extends TupleWithRefItem<{ size: number }>>(
  list: T[],
) {
  list.sort((a, b) => {
    if (!a.length || !b.length) {
      return 0;
    }
    const aItems = a[1];
    const bItems = b[1];
    if (!aItems.length || !bItems.length) {
      return 0;
    }
    return bItems[0].size - aItems[0].size;
  });
}

function convertDuplicateEntry(
  item: RawDuplicateEntry,
  isRef: boolean,
  groupId?: number,
): DuplicateEntry {
  return {
    size: fmtFileSize(item.size),
    fileName: pathBaseName(item.path),
    path: item.path,
    modifiedDate: fmtDate(item.modified_date),
    hash: item.hash,
    isRef,
    hidden: false,
    isImage: isImage(item.path),
    raw: item,
    groupId,
  };
}

export function convertDuplicateEntries(
  list: TupleWithRefItem<RawDuplicateEntry>[],
): DuplicateEntry[] {
  sortTupleWithRefItemList(list);
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, items] = tuple;
    const convertedItems = items.map((item) => {
      return convertDuplicateEntry(item, false, id);
    });
    if (ref) {
      convertedItems.unshift(convertDuplicateEntry(ref, true));
    }
    if (idx !== list.length - 1) {
      const hiddenRow: DuplicateEntry = {
        size: '',
        fileName: '',
        path: `${HIDDEN_ROW_PREFIX}${id}`,
        modifiedDate: '',
        hash: '',
        isRef: true,
        hidden: true,
        isImage: false,
        raw: {
          path: '',
          modified_date: 0,
          size: 0,
          hash: '',
        },
      };
      convertedItems.push(hiddenRow);
      id += 1;
    }
    return convertedItems;
  });
}

export function convertFolderEntries(
  list: RawFolderOrTemporaryFileEntry[],
): FolderEntry[] {
  return list.map((item) => {
    return {
      folderName: pathBaseName(item.path),
      path: item.path,
      modifiedDate: fmtDate(item.modified_date),
    };
  });
}

export function convertFileEntries(list: RawFileEntry[]): FileEntry[] {
  return list.map((item) => {
    return {
      size: fmtFileSize(item.size),
      fileName: pathBaseName(item.path),
      path: item.path,
      modifiedDate: fmtDate(item.modified_date),
      rawData: item,
    };
  });
}

export function convertTemporaryFileEntries(
  list: RawFolderOrTemporaryFileEntry[],
): TemporaryFileEntry[] {
  return list.map((item) => {
    return {
      fileName: pathBaseName(item.path),
      path: item.path,
      modifiedDate: fmtDate(item.modified_date),
    };
  });
}

function convertImagesEntry(
  item: RawImagesEntry,
  isRef: boolean,
  groupId?: number,
): ImagesEntry {
  return {
    size: fmtFileSize(item.size),
    fileName: pathBaseName(item.path),
    path: item.path,
    modifiedDate: fmtDate(item.modified_date),
    similarity: item.similarity,
    dimensions: `${item.width}x${item.height}`,
    isRef,
    hidden: false,
    raw: item,
    groupId,
  };
}

export function convertImagesEntries(
  list: TupleWithRefItem<RawImagesEntry>[],
): ImagesEntry[] {
  sortTupleWithRefItemList(list);
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, items] = tuple;
    const convertedFiles = items.map((item) =>
      convertImagesEntry(item, false, id),
    );
    if (ref) {
      convertedFiles.unshift(convertImagesEntry(ref, true));
    }
    if (idx !== list.length - 1) {
      const hiddenRow: ImagesEntry = {
        size: '',
        fileName: '',
        path: `${HIDDEN_ROW_PREFIX}${id}`,
        modifiedDate: '',
        similarity: '',
        dimensions: '',
        isRef: true,
        hidden: true,
        raw: {
          path: '',
          size: 0,
          width: 0,
          height: 0,
          modified_date: 0,
          similarity: '',
        },
      };
      convertedFiles.push(hiddenRow);
      id += 1;
    }
    return convertedFiles;
  });
}

function convertVideosEntry(
  item: RawVideosEntry,
  isRef: boolean,
  groupId?: number,
): VideosEntry {
  return {
    size: fmtFileSize(item.size),
    fileName: pathBaseName(item.path),
    path: item.path,
    modifiedDate: fmtDate(item.modified_date),
    isRef,
    hidden: false,
    raw: item,
    groupId,
  };
}

export function convertVideosEntries(
  list: TupleWithRefItem<RawVideosEntry>[],
): VideosEntry[] {
  sortTupleWithRefItemList(list);
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, items] = tuple;
    const convertedFiles = items.map((item) =>
      convertVideosEntry(item, false, id),
    );
    if (ref) {
      convertedFiles.unshift(convertVideosEntry(ref, true));
    }
    if (idx !== list.length - 1) {
      const hiddenRow: VideosEntry = {
        size: '',
        fileName: '',
        path: `${HIDDEN_ROW_PREFIX}${id}`,
        modifiedDate: '',
        isRef: true,
        hidden: true,
        raw: {
          path: '',
          size: 0,
          modified_date: 0,
        },
      };
      convertedFiles.push(hiddenRow);
      id += 1;
    }
    return convertedFiles;
  });
}

function convertMusicEntry(
  item: RawMusicEntry,
  isRef: boolean,
  groupId?: number,
): MusicEntry {
  return {
    size: fmtFileSize(item.size),
    fileName: pathBaseName(item.path),
    path: item.path,
    modifiedDate: fmtDate(item.modified_date),
    trackTitle: item.track_title,
    trackArtist: item.track_artist,
    year: item.year,
    length: item.length,
    genre: item.genre,
    bitrate: item.bitrate.toString(),
    isRef,
    hidden: false,
    raw: item,
    groupId,
  };
}

export function convertMusicEntries(
  list: TupleWithRefItem<RawMusicEntry>[],
): MusicEntry[] {
  sortTupleWithRefItemList(list);
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, items] = tuple;
    const convertedFiles = items.map((item) =>
      convertMusicEntry(item, false, id),
    );
    if (ref) {
      convertedFiles.unshift(convertMusicEntry(ref, true));
    }
    if (idx !== list.length - 1) {
      const hiddenRow: MusicEntry = {
        size: '',
        fileName: '',
        path: `${HIDDEN_ROW_PREFIX}${id}`,
        modifiedDate: '',
        trackTitle: '',
        trackArtist: '',
        year: '',
        length: '',
        genre: '',
        bitrate: '',
        isRef: true,
        hidden: true,
        raw: {
          path: '',
          size: 0,
          modified_date: 0,
          track_title: '',
          track_artist: '',
          year: '',
          length: '',
          genre: '',
          bitrate: 0,
        },
      };
      convertedFiles.push(hiddenRow);
      id += 1;
    }
    return convertedFiles;
  });
}

export function convertSymlinksFileEntries(
  list: RawSymlinksFileEntry[],
): SymlinksFileEntry[] {
  const displayTypeOfError = (v: string) => {
    if (v === 'InfiniteRecursion') {
      return 'Infinite recursion';
    }
    if (v === 'NonExistentFile') {
      return 'Non existent file';
    }
    return v;
  };

  return list.map((item) => {
    return {
      path: item.path,
      symlinkName: pathBaseName(item.path),
      modifiedDate: fmtDate(item.modified_date),
      destinationPath: item.symlink_info.destination_path,
      typeOfError: displayTypeOfError(item.symlink_info.type_of_error),
      size: fmtFileSize(item.size),
    };
  });
}

export function convertBorkenEntries(list: RawBrokenEntry[]): BrokenEntry[] {
  return list.map((item) => {
    return {
      path: item.path,
      fileName: pathBaseName(item.path),
      modifiedDate: fmtDate(item.modified_date),
      size: fmtFileSize(item.size),
      errorString: item.error_string,
    };
  });
}

export function convertBadFileEntries(list: RawBadFileEntry[]): BadFileEntry[] {
  return list.map((item) => {
    return {
      path: item.path,
      fileName: pathBaseName(item.path),
      modifiedDate: fmtDate(item.modified_date),
      currentExtension: item.current_extension,
      properExtensionsGroup: item.proper_extensions_group,
      properExtension: item.proper_extension,
    };
  });
}
