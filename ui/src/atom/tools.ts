import { atom } from 'jotai';
import type {
  FilterStateUpdater,
  RowSelectionUpdater,
  SortingStateUpdater,
} from '~/components/data-table';
import type { BaseEntry } from '~/types';
import { is2DArray } from '~/utils/common';
import {
  baseCompareFn,
  baseFilterFn,
  insertHiddenRows,
} from '~/utils/table-helper';
import {
  currentToolAtom,
  filterAtom,
  filteredTableDataAtom,
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
    const newFilter =
      typeof updater === 'function' ? updater(filter[currentTool]) : updater;

    set(filterAtom, {
      ...filter,
      [currentTool]: newFilter,
    });

    let filteredData: BaseEntry[] | BaseEntry[][] = [];
    if (newFilter !== '') {
      const currentToolData = get(currentToolDataAtom);

      if (is2DArray(currentToolData)) {
        filteredData = currentToolData
          .map((group) => {
            return group.filter((item) => baseFilterFn(item, newFilter));
          })
          .filter((group) => group.length > 0);
      } else {
        filteredData = currentToolData.filter((item) =>
          baseFilterFn(item, newFilter),
        );
      }
    }
    set(filteredTableDataAtom, (old) => {
      return {
        ...old,
        [currentTool]: filteredData,
      };
    });
  },
);

export const restoreFilterAtom = atom(null, (get, set) => {
  const filter = get(currentToolFilterAtom);
  set(searchInputValueAtom, filter);
});

export const currentFilteredOrAllTableDataAtom = atom((get) => {
  const currentTool = get(currentToolAtom);
  const filter = get(currentToolFilterAtom);
  if (filter) {
    const filteredTableData = get(filteredTableDataAtom);
    return filteredTableData[currentTool];
  }
  const toolData = get(toolDataAtom);
  return toolData[currentTool];
});

export function createGroupedDataAtom<T extends BaseEntry>() {
  return atom((get) => {
    const data = get(currentFilteredOrAllTableDataAtom).slice() as T[][];

    const sorting = get(currentToolSortingAtom);
    if (sorting.length) {
      for (let group of data) {
        group = [...group];
        group.sort((a, b) => baseCompareFn(a, b, sorting[0]));
      }
      data.sort((aGroup, bGroup) => {
        return baseCompareFn(aGroup[0], bGroup[0], sorting[0]);
      });
    }

    return insertHiddenRows(data);
  });
}

export function createFlatDataAtom<T extends BaseEntry>() {
  return atom((get) => {
    const data = get(currentFilteredOrAllTableDataAtom).slice() as T[];

    const sorting = get(currentToolSortingAtom);
    if (sorting.length) {
      data.sort((a, b) => baseCompareFn(a, b, sorting[0]));
    }

    return data;
  });
}

export const totalCountAtom = atom((get) => {
  const data = get(currentToolDataAtom);
  if (is2DArray(data)) {
    return data.reduce((acc, group) => acc + group.length, 0);
  }
  return data.length;
});

export const selectedCountAtom = atom((get) => {
  const rowSelection = get(currentToolRowSelectionAtom);
  return Object.keys(rowSelection).length;
});

export const foundCountAtom = atom((get) => {
  const currentTool = get(currentToolAtom);
  const filteredTableData = get(filteredTableDataAtom);
  const currentFilteredTableData = filteredTableData[currentTool];
  if (is2DArray(currentFilteredTableData)) {
    return currentFilteredTableData.reduce(
      (acc, group) => acc + group.length,
      0,
    );
  }
  return currentFilteredTableData.length;
});
