import { format } from 'date-fns';
import { filesize } from 'filesize';
import type { RowSelection } from '~/components/data-table';
import type {
  DuplicateEntry,
  FileEntry,
  RawDuplicateEntry,
  RawFileEntry,
} from '~/types';

export function splitStr(s: string): string[] {
  return s
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function getRowSelectionKeys(rowSelection: RowSelection): string[] {
  return Object.entries(rowSelection)
    .filter((obj) => obj[1] && !obj[0].startsWith('__hidden__'))
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

export function isImage(fileName: string): boolean {
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
    raw: item,
  };
}

export function convertDuplicateEntries(
  list: [[RawDuplicateEntry | null, RawDuplicateEntry[]]],
): DuplicateEntry[] {
  list.sort((a, b) => {
    if (!a.length || !b.length) {
      return 0;
    }
    const aFiles = a[1];
    const bFiles = b[1];
    if (!aFiles.length || !bFiles.length) {
      return 0;
    }
    return bFiles[0].size - aFiles[0].size;
  });
  let id = 1;
  return list.flatMap((tuple, idx) => {
    const [ref, files] = tuple;
    const convertedFiles = files.map((item) =>
      convertDuplicateEntry(item, false),
    );
    if (ref) {
      convertedFiles.unshift(convertDuplicateEntry(ref, true));
    }
    if (idx !== list.length - 1) {
      convertedFiles.push({
        size: '',
        fileName: '',
        path: `__hidden__${id}`,
        modifiedDate: '',
        hash: '',
        isRef: true,
        hidden: true,
        raw: {
          path: '',
          modified_date: 0,
          size: 0,
          hash: '',
        },
      });
      id += 1;
    }
    return convertedFiles;
  });
}
