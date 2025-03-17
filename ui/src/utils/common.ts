import { format } from 'date-fns';
import { filesize } from 'filesize';
import type { RowSelection } from '~/components/data-table';
import type {
  DuplicateEntry,
  FileEntry,
  FolderEntry,
  ImagesEntry,
  RawDuplicateEntry,
  RawFileEntry,
  RawFolderOrTemporaryFileEntry,
  RawImagesEntry,
  RawVideosEntry,
  TemporaryFileEntry,
  TupleWithRefItem,
  VideosEntry,
} from '~/types';

const HIDDEN_ROW_PREFIX = '__hidden__';

export function splitStr(s: string): string[] {
  return s
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// todo: ignore ref item
export function getRowSelectionKeys(rowSelection: RowSelection): string[] {
  return Object.entries(rowSelection)
    .filter((obj) => obj[1] && !obj[0].startsWith(HIDDEN_ROW_PREFIX))
    .map((obj) => obj[0]);
}

function fmtFileSize(v: number): string {
  return filesize(v, { standard: 'si' }).toUpperCase();
}

function pathBaseName(path: string): string {
  const normalizedPath = path.replace(/\\/g, '/');
  const match = normalizedPath.match(/([^\/]+)\/?$/);
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
  };
}

export function convertDuplicateEntries(
  list: TupleWithRefItem<RawDuplicateEntry>[],
): DuplicateEntry[] {
  sortTupleWithRefItemList(list);
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, items] = tuple;
    const convertedItems = items.map((item) =>
      convertDuplicateEntry(item, false),
    );
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

function convertImagesEntry(item: RawImagesEntry, isRef: boolean): ImagesEntry {
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
  };
}

export function convertImagesEntries(
  list: TupleWithRefItem<RawImagesEntry>[],
): ImagesEntry[] {
  sortTupleWithRefItemList(list);
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, items] = tuple;
    const convertedFiles = items.map((item) => convertImagesEntry(item, false));
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
function convertVideosEntry(item: RawVideosEntry, isRef: boolean): VideosEntry {
  return {
    size: fmtFileSize(item.size),
    fileName: pathBaseName(item.path),
    path: item.path,
    modifiedDate: fmtDate(item.modified_date),
    isRef,
    hidden: false,
    raw: item,
  };
}

export function convertVideosEntries(
  list: [RawVideosEntry | null, RawVideosEntry[]][],
): VideosEntry[] {
  sortTupleWithRefItemList(list);
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, items] = tuple;
    const convertedFiles = items.map((item) => convertVideosEntry(item, false));
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
