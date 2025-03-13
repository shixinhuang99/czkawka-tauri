import { format } from 'date-fns';
import { filesize } from 'filesize';
import type { RowSelection } from '~/components/data-table';

export function splitStr(s: string): string[] {
  return s
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function getRowSelectionKeys(rowSelection: RowSelection): string[] {
  return Object.entries(rowSelection)
    .filter((obj) => obj[1])
    .map((obj) => obj[0]);
}

export function fmtFileSize(v: number): string {
  return filesize(v, { standard: 'si' }).toUpperCase();
}

export function pathBaseName(path: string): string {
  const normalizedPath = path.replace(/\\/g, '/');
  const match = normalizedPath.match(/([^\/]+)\/?$/);
  return match ? match[1] : '';
}

export function fmtDate(v: number): string {
  return format(v * 1000, 'yyyy/MM/dd HH:mm:ss');
}
