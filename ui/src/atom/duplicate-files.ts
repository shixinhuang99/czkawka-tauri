import type { SortingState } from '@tanstack/react-table';
import { atom } from 'jotai';
import { currentToolDataAtom, currentToolSortingAtom } from '~/atom/tools';
import { HIDDEN_ROW_PREFIX } from '~/consts';
import type { DuplicateEntry } from '~/types';

function compareByField(
  a: DuplicateEntry,
  b: DuplicateEntry,
  id: string,
  desc: boolean,
): number {
  if (id === 'size' || id === 'modified_date') {
    const comparison = a.rawData[id] - b.rawData[id];
    return desc ? -comparison : comparison;
  }

  if (id === 'path' || id === 'fileName') {
    const comparison = a[id].localeCompare(b[id]);
    return desc ? -comparison : comparison;
  }

  return 0;
}

function sortItems(items: DuplicateEntry[], sorting: SortingState) {
  if (!sorting.length) {
    return items;
  }
  const { id, desc } = sorting[0];
  items.sort((a, b) => compareByField(a, b, id, desc));
}

function sortGroups(groups: DuplicateEntry[][], sorting: SortingState) {
  if (!sorting.length) {
    return groups;
  }
  const { id, desc } = sorting[0];
  groups.sort((aGroup, bGroup) => {
    return compareByField(aGroup[0], bGroup[0], id, desc);
  });
}

function insertHiddenRows(groups: DuplicateEntry[][]): DuplicateEntry[] {
  const result: DuplicateEntry[] = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    result.push(...group);

    if (i !== groups.length - 1) {
      const groupId = group[0].groupId;
      const hiddenRow: DuplicateEntry = {
        size: '',
        fileName: '',
        path: `${HIDDEN_ROW_PREFIX}${groupId}`,
        modifiedDate: '',
        hash: '',
        isRef: true,
        hidden: true,
        isImage: false,
        rawData: {
          path: '',
          modified_date: 0,
          size: 0,
          hash: '',
        },
      };
      result.push(hiddenRow);
    }
  }

  return result;
}

export const DuplicateFilesDataAtom = atom((get) => {
  const data = get(currentToolDataAtom) as DuplicateEntry[][];
  const sorting = get(currentToolSortingAtom);

  data.forEach((group) => {
    sortItems(group, sorting);
  });
  sortGroups(data, sorting);
  const withHiddenRows = insertHiddenRows(data);

  return withHiddenRows;
});
