import { atom } from 'jotai';
import type {
  FilterStateUpdater,
  RowSelectionUpdater,
  SortingStateUpdater,
} from '~/components/data-table';
import type { BaseEntry } from '~/types';
import {
  type CompareFn,
  type CreateHiddenRowFn,
  filterGroups,
  insertHiddenRows,
  sortGroups,
  sortItems,
} from '~/utils/table-helper';
import {
  currentToolAtom,
  filterAtom,
  progressAtom,
  rowSelectionAtom,
  searchInputValueAtom,
  sortingAtom,
  toolDataAtom,
} from './primitive';

export const currentToolDataAtom = atom(
  (get) => {
    const currentTool = get(currentToolAtom);
    const toolData = get(toolDataAtom);
    return toolData[currentTool];
  },
  (get, set, data: any[] | any[][]) => {
    const currentTool = get(currentToolAtom);
    const toolData = get(toolDataAtom);
    set(toolDataAtom, {
      ...toolData,
      [currentTool]: data,
    });
  },
);

export const setToolInProgressDataAtom = atom(
  null,
  (get, set, data: any[] | any[][]) => {
    const progress = get(progressAtom);
    if (!progress.tool) {
      return;
    }
    const toolData = get(toolDataAtom);
    set(toolDataAtom, {
      ...toolData,
      [progress.tool]: data,
    });
  },
);

export const currentToolRowSelectionAtom = atom(
  (get) => {
    const currentTool = get(currentToolAtom);
    const rowSelection = get(rowSelectionAtom);
    return rowSelection[currentTool];
  },
  (get, set, updater: RowSelectionUpdater) => {
    const currentTool = get(currentToolAtom);
    const rowSelection = get(rowSelectionAtom);
    set(rowSelectionAtom, {
      ...rowSelection,
      [currentTool]:
        typeof updater === 'function'
          ? updater(rowSelection[currentTool])
          : updater,
    });
  },
);

export const clearToolInProgressRowSelectionAtom = atom(null, (get, set) => {
  const progress = get(progressAtom);
  if (!progress.tool) {
    return;
  }
  const rowSelection = get(rowSelectionAtom);
  set(rowSelectionAtom, {
    ...rowSelection,
    [progress.tool]: {},
  });
});

export const currentToolSortingAtom = atom(
  (get) => {
    const currentTool = get(currentToolAtom);
    const sorting = get(sortingAtom);
    return sorting[currentTool];
  },
  (get, set, updater: SortingStateUpdater) => {
    const currentTool = get(currentToolAtom);
    const sorting = get(sortingAtom);
    set(sortingAtom, {
      ...sorting,
      [currentTool]:
        typeof updater === 'function' ? updater(sorting[currentTool]) : updater,
    });
  },
);

export const currentToolFilterAtom = atom(
  (get) => {
    const currentTool = get(currentToolAtom);
    const filter = get(filterAtom);
    return filter[currentTool];
  },
  (get, set, updater: FilterStateUpdater) => {
    const currentTool = get(currentToolAtom);
    const filter = get(filterAtom);
    set(filterAtom, {
      ...filter,
      [currentTool]:
        typeof updater === 'function' ? updater(filter[currentTool]) : updater,
    });
  },
);

export const restoreFilterAtom = atom(null, (get, set) => {
  const filter = get(currentToolFilterAtom);
  set(searchInputValueAtom, filter);
});

export function createProcessedDataAtom<T extends BaseEntry>(
  compareFn: CompareFn<T>,
  createHiddenRow: CreateHiddenRowFn<T>,
  filterKeys: (keyof T)[],
) {
  return atom((get) => {
    let data = get(currentToolDataAtom) as T[][];
    const sorting = get(currentToolSortingAtom);
    const filter = get(currentToolFilterAtom);

    data = filterGroups(data, filter, filterKeys);

    for (const group of data) {
      sortItems(group, sorting, compareFn);
    }
    sortGroups(data, sorting, compareFn);
    return insertHiddenRows(data, createHiddenRow);
  });
}
