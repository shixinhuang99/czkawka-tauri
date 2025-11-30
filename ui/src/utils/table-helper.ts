import type { RowSelectionState } from '@tanstack/react-table';
import { HIDDEN_ROW_PREFIX } from '~/consts';
import type { BaseEntry } from '~/types';

export function getRowSelectionKeys(rowSelection: RowSelectionState): string[] {
  const keys: string[] = [];
  for (const kv of Object.entries(rowSelection)) {
    if (kv[1] && !kv[0].startsWith(HIDDEN_ROW_PREFIX)) {
      keys.push(kv[0]);
    }
  }
  return keys;
}

export function getPathsFromEntries<T extends BaseEntry>(list: T[]): string[] {
  const paths: string[] = [];
  for (const item of list) {
    if (item.isRef || item.hidden) {
      continue;
    }
    paths.push(item.path);
  }
  return paths;
}
