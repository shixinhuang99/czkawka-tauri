import type {
  ColumnSort,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import { HIDDEN_ROW_PREFIX } from '~/consts';
import type { BaseEntry } from '~/types';
import { is2DArray } from '~/utils/common';

export function filterGroups<T extends BaseEntry>(
  groups: T[][],
  filter: string,
  filterKeys: (keyof T)[],
): T[][] {
  if (!filter) {
    return groups;
  }

  const filtered = groups
    .map((group) => {
      return group.filter((item) => {
        for (const key of filterKeys) {
          if (typeof item[key] !== 'string') {
            continue;
          }
          if (item[key].includes(filter)) {
            return true;
          }
        }
        return false;
      });
    })
    .filter((group) => group.length > 0);

  return filtered;
}

export function getRowSelectionKeys(rowSelection: RowSelectionState): string[] {
  const keys: string[] = [];
  for (const kv of Object.entries(rowSelection)) {
    if (kv[1] && !kv[0].startsWith(HIDDEN_ROW_PREFIX)) {
      keys.push(kv[0]);
    }
  }
  return keys;
}

export function getPathsFromEntries<T extends BaseEntry>(
  list: T[] | T[][],
): string[] {
  const paths: string[] = [];
  if (is2DArray(list)) {
    for (const sublist of list) {
      for (const item of sublist) {
        if (item.isRef || item.hidden) {
          continue;
        }
        paths.push(item.path);
      }
    }
  } else {
    for (const item of list) {
      if (item.isRef || item.hidden) {
        continue;
      }
      paths.push(item.path);
    }
  }
  return paths;
}

export type CompareFn<T> = (a: T, b: T, columnSort: ColumnSort) => number;
export type CreateHiddenRowFn<T> = (fakePath: string) => T;

export function sortItems<T extends BaseEntry>(
  items: T[],
  sorting: SortingState,
  compareFn: CompareFn<T>,
): void {
  if (!sorting.length) {
    return;
  }
  items.sort((a, b) => compareFn(a, b, sorting[0]));
}

export function sortGroups<T extends BaseEntry>(
  groups: T[][],
  sorting: SortingState,
  compareFn: CompareFn<T>,
): void {
  if (!sorting.length) {
    return;
  }
  groups.sort((aGroup, bGroup) => {
    return compareFn(aGroup[0], bGroup[0], sorting[0]);
  });
}

export function insertHiddenRows<T extends BaseEntry>(
  groups: T[][],
  createHiddenRow: CreateHiddenRowFn<T>,
): T[] {
  const result: T[] = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    result.push(...group);

    if (i !== groups.length - 1) {
      const groupId = group[0].groupId;
      if (groupId !== undefined) {
        result.push(createHiddenRow(`${HIDDEN_ROW_PREFIX}${groupId}`));
      }
    }
  }

  return result;
}
