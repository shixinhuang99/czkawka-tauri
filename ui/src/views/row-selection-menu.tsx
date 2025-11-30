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
import { getPathsFromEntries, getRowSelectionKeys } from '~/utils/table-helper';

const toolsWithSizeAndDateSelect = new Set<string>([
  Tools.DuplicateFiles,
  Tools.SimilarImages,
  Tools.SimilarVideos,
  Tools.MusicDuplicates,
]);

export function RowSelectionMenu(props: { disabled: boolean }) {
  const { disabled } = props;

  const currentTool = useAtomValue(currentToolAtom);
  const currentToolData = useAtomValue(currentToolDataAtom) as BaseEntry[];
  const setCurrentToolRowSelection = useSetAtom(currentToolRowSelectionAtom);
  const t = useT();

  const handleInvertSelection = () => {
    invertSelection(currentToolData, setCurrentToolRowSelection);
  };

  const handleSelectXXX = (
    type: 'size' | 'date' | 'resolution',
    dir: 'asc' | 'desc',
  ) => {
    if (!toolsWithSizeAndDateSelect.has(currentTool)) {
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
              onClick={() => handleSelectXXX('resolution', 'asc')}
            >
              {t('selectTheHighestResolution')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSelectXXX('resolution', 'desc')}
            >
              {t('selectTheLowestResolution')}
            </DropdownMenuItem>
          </>
        )}
        {toolsWithSizeAndDateSelect.has(currentTool) && (
          <>
            <DropdownMenuItem onClick={() => handleSelectXXX('size', 'asc')}>
              {t('selectTheBiggestSize')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectXXX('size', 'desc')}>
              {t('selectTheSmallestSize')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectXXX('date', 'asc')}>
              {t('selectTheNewest')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectXXX('date', 'desc')}>
              {t('selectTheOldest')}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleInvertSelection}>
          {t('invertSelection')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function invertSelection<T extends BaseEntry>(
  data: T[],
  setFn: (updater: (v: RowSelectionState) => RowSelectionState) => void,
) {
  const paths = getPathsFromEntries(data);
  setFn((old) => convertRowSelection(old, paths));
}

function convertRowSelection(
  old: RowSelectionState,
  paths: string[],
): RowSelectionState {
  const selected = new Set(getRowSelectionKeys(old));
  const unselected = paths.filter((v) => !selected.has(v));
  const result = pathsToRowSelection(unselected);
  return result;
}

function pathsToRowSelection(paths: string[]): RowSelectionState {
  const obj = Object.fromEntries(
    paths.map((v) => {
      return [v, true];
    }),
  );
  return obj;
}

function groupBy<T extends BaseEntry>(list: T[]): T[][] {
  const map: Map<number, T[]> = new Map();

  for (const item of list) {
    if (!item.groupId) {
      continue;
    }
    const v = map.get(item.groupId);
    if (v) {
      v.push(item);
    } else {
      map.set(item.groupId, [item]);
    }
  }

  return Array.from(map.values());
}

function selectItem<T extends BaseEntry>(
  data: T[],
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
  const groups = groupBy(data);
  for (const group of groups) {
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
