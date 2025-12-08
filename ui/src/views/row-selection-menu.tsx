import type { RowSelectionState } from '@tanstack/react-table';
import { useAtomValue, useSetAtom } from 'jotai';
import { SquareMousePointerIcon } from 'lucide-react';
import { currentToolAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/shadcn/dropdown-menu';
import { Tools } from '~/consts';
import { useT } from '~/hooks';
import type { BaseEntry } from '~/types';
import { is2DArray } from '~/utils/common';
import { getPathsFromEntries, getRowSelectionKeys } from '~/utils/table-helper';

const toolsWithExtraSelection = new Set<string>([
  Tools.DuplicateFiles,
  Tools.SimilarImages,
  Tools.SimilarVideos,
  Tools.MusicDuplicates,
]);

export function SelectionMenu({ disabled }: { disabled: boolean }) {
  const currentTool = useAtomValue(currentToolAtom);
  const currentToolData = useAtomValue(currentToolDataAtom);
  const setCurrentToolRowSelection = useSetAtom(currentToolRowSelectionAtom);
  const t = useT();

  const handleInvertSelection = () => {
    const paths = getPathsFromEntries(currentToolData);
    setCurrentToolRowSelection((old) => invertRowSelection(old, paths));
  };

  const handleSelectAll = () => {
    const paths = getPathsFromEntries(currentToolData);
    setCurrentToolRowSelection(pathsToRowSelection(paths));
  };

  const handleClearSelection = () => {
    setCurrentToolRowSelection({});
  };

  const handleExtraSelecttion = (
    type: 'size' | 'date' | 'resolution',
    dir: 'asc' | 'desc',
  ) => {
    if (
      !toolsWithExtraSelection.has(currentTool) ||
      !is2DArray(currentToolData)
    ) {
      return;
    }
    setCurrentToolRowSelection(selectItem(currentToolData, type, dir));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <OperationButton disabled={disabled}>
          <SquareMousePointerIcon />
          {t('select')}
        </OperationButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        {currentTool === Tools.SimilarImages && (
          <>
            <DropdownMenuItem
              onClick={() => handleExtraSelecttion('resolution', 'asc')}
            >
              {t('selectTheHighestResolution')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExtraSelecttion('resolution', 'desc')}
            >
              {t('selectTheLowestResolution')}
            </DropdownMenuItem>
          </>
        )}
        {toolsWithExtraSelection.has(currentTool) && (
          <>
            <DropdownMenuItem
              onClick={() => handleExtraSelecttion('size', 'asc')}
            >
              {t('selectTheBiggestSize')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExtraSelecttion('size', 'desc')}
            >
              {t('selectTheSmallestSize')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExtraSelecttion('date', 'asc')}
            >
              {t('selectTheNewest')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExtraSelecttion('date', 'desc')}
            >
              {t('selectTheOldest')}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleInvertSelection}>
          {t('invertSelection')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSelectAll}>
          {t('selectAll')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleClearSelection}>
          {t('clearSelection')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function invertRowSelection(
  old: RowSelectionState,
  paths: string[],
): RowSelectionState {
  const selected = new Set(getRowSelectionKeys(old));
  const unselected = paths.filter((v) => !selected.has(v));
  return pathsToRowSelection(unselected);
}

function pathsToRowSelection(paths: string[]): RowSelectionState {
  return Object.fromEntries(
    paths.map((v) => {
      return [v, true];
    }),
  );
}

function selectItem<T extends BaseEntry>(
  data: T[][],
  type: 'size' | 'date' | 'resolution',
  dir: 'asc' | 'desc',
): RowSelectionState {
  const paths: string[] = [];
  let compareFn: ((a: T, b: T) => T) | null = null;
  if (type === 'size' && dir === 'asc') {
    compareFn = pickBiggest;
  } else if (type === 'size' && dir === 'desc') {
    compareFn = pickSmallest;
  } else if (type === 'date' && dir === 'asc') {
    compareFn = pickNewst;
  } else if (type === 'date' && dir === 'desc') {
    compareFn = pickOldest;
  } else if (type === 'resolution' && dir === 'asc') {
    compareFn = pickHighestResolution;
  } else if (type === 'resolution' && dir === 'desc') {
    compareFn = pickLowestResolution;
  }
  if (!compareFn) {
    return {};
  }
  for (const group of data) {
    if (!group.length) {
      continue;
    }
    const path = group.reduce(compareFn).path;
    paths.push(path);
  }
  return pathsToRowSelection(paths);
}

function pickBiggest<T extends BaseEntry>(a: T, b: T): T {
  return a.rawData.size >= b.rawData.size ? a : b;
}

function pickSmallest<T extends BaseEntry>(a: T, b: T): T {
  return a.rawData.size <= b.rawData.size ? a : b;
}

function pickNewst<T extends BaseEntry>(a: T, b: T): T {
  return a.rawData.modified_date >= b.rawData.modified_date ? a : b;
}

function pickOldest<T extends BaseEntry>(a: T, b: T): T {
  return a.rawData.modified_date <= b.rawData.modified_date ? a : b;
}

function pickHighestResolution<T extends BaseEntry>(a: T, b: T): T {
  return a.rawData.width * a.rawData.height >=
    b.rawData.width * b.rawData.height
    ? a
    : b;
}

function pickLowestResolution<T extends BaseEntry>(a: T, b: T): T {
  return a.rawData.width * a.rawData.height <=
    b.rawData.width * b.rawData.height
    ? a
    : b;
}
