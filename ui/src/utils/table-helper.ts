import type { ColumnSort, RowSelectionState } from '@tanstack/react-table';
import toSeconds from 'sec';
import { HIDDEN_ROW_PREFIX } from '~/consts';
import type { BaseEntry } from '~/types';
import { is2DArray } from '~/utils/common';

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

const EXCLUDE_KEYS = ['rawData', 'hidden', 'isRef', 'groupId', 'isImage'];

export function baseFilterFn(
  item: Record<string, any>,
  filter: string,
): boolean {
  for (const key in item) {
    if (EXCLUDE_KEYS.includes(key) || typeof item[key] !== 'string') {
      continue;
    }
    if (item[key].includes(filter)) {
      return true;
    }
  }
  return false;
}

type CompareItem = { [key: string]: any; rawData: { [key: string]: any } };

export function baseCompareFn(
  a: CompareItem,
  b: CompareItem,
  columnSort: ColumnSort,
) {
  const { id, desc } = columnSort;
  let comparison = 0;

  if (['size', 'modified_date', 'bitrate'].includes(id)) {
    comparison = a.rawData[id] - b.rawData[id];
  } else if (id === 'length') {
    comparison = toSeconds(a[id]) - toSeconds(b[id]);
  } else if (id === 'dimensions') {
    const dimensionsA = a.rawData.width * a.rawData.height;
    const dimensionsB = b.rawData.width * b.rawData.height;
    comparison = dimensionsA - dimensionsB;
  } else {
    comparison = a[id].localeCompare(b[id]);
  }

  return desc ? -comparison : comparison;
}

export function insertHiddenRows<T extends BaseEntry>(groups: T[][]): T[] {
  const result: T[] = [];

  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    result.push(...group);

    if (i !== groups.length - 1) {
      const groupId = group[0].groupId;
      if (group[0].groupId !== undefined) {
        result.push({
          path: `${HIDDEN_ROW_PREFIX}${groupId}`,
          isRef: true,
          hidden: true,
          isImage: false,
          rawData: {
            path: `${HIDDEN_ROW_PREFIX}${groupId}`,
          },
        } as any);
      }
    }
  }

  return result;
}
