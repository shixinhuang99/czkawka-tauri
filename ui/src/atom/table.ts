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
  tableDataAtom,
} from './primitive';

export const currentTableDataAtom = atom(
  (get) => {
    const currentTool = get(currentToolAtom);
    const tableData = get(tableDataAtom);
    return tableData[currentTool];
  },
  (
    get,
    set,
    updater:
      | (BaseEntry[] | BaseEntry[][])
      | ((v: BaseEntry[] | BaseEntry[][]) => BaseEntry[] | BaseEntry[][]),
  ) => {
    const currentTool = get(currentToolAtom);
    const tableData = get(tableDataAtom);
    set(tableDataAtom, {
      ...tableData,
      [currentTool]:
        typeof updater === 'function'
          ? updater(tableData[currentTool])
          : updater,
    });
  },
);

export const setInProgressTableDataAtom = atom(
  null,
  (get, set, data: any[] | any[][]) => {
    const progress = get(progressAtom);
    if (!progress.tool) {
      return;
    }
    const tableData = get(tableDataAtom);
    set(tableDataAtom, {
      ...tableData,
      [progress.tool]: data,
    });
  },
);

export const currentRowSelectionAtom = atom(
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

export const clearInProgressRowSelectionAtom = atom(null, (get, set) => {
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

export const currentSortingAtom = atom(
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

export const currentFilterAtom = atom(
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
      const tableData = get(currentTableDataAtom);

      if (is2DArray(tableData)) {
        filteredData = tableData
          .map((group) => {
            return group.filter((item) => baseFilterFn(item, newFilter));
          })
          .filter((group) => group.length > 0);
      } else {
        filteredData = tableData.filter((item) =>
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
  const filter = get(currentFilterAtom);
  set(searchInputValueAtom, filter);
});

export const currentFilteredTableDataAtom = atom((get) => {
  const currentTool = get(currentToolAtom);
  const filter = get(currentFilterAtom);
  if (filter) {
    const filteredTableData = get(filteredTableDataAtom);
    return filteredTableData[currentTool];
  }
  const tableData = get(tableDataAtom);
  return tableData[currentTool];
});

export const totalCountAtom = atom((get) => {
  const data = get(currentTableDataAtom);
  if (is2DArray(data)) {
    return data.reduce((acc, group) => acc + group.length, 0);
  }
  return data.length;
});

export const selectedCountAtom = atom((get) => {
  const rowSelection = get(currentRowSelectionAtom);
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

export const tableDataWithSortingAndFilterAtom = atom<any[]>((get) => {
  const data = get(currentFilteredTableDataAtom);
  const sorting = get(currentSortingAtom);

  if (is2DArray(data)) {
    const groupedData = data.slice();
    if (sorting.length) {
      for (let group of groupedData) {
        group = [...group];
        group.sort((a, b) => baseCompareFn(a, b, sorting[0]));
      }
      groupedData.sort((aGroup, bGroup) => {
        return baseCompareFn(aGroup[0], bGroup[0], sorting[0]);
      });
    }
    return insertHiddenRows(groupedData);
  }

  const flatData = data.slice();
  if (sorting.length) {
    flatData.sort((a, b) => baseCompareFn(a, b, sorting[0]));
  }
  return flatData;
});
