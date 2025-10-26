import { useAtomValue, useSetAtom } from 'jotai';
import { SquareMousePointerIcon } from 'lucide-react';
import { currentToolAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import type { RowSelection } from '~/components/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/shadcn/dropdown-menu';
import { Tools } from '~/consts';
import { useT } from '~/hooks';
import type { BaseEntry, RefEntry } from '~/types';
import { getPathsFromEntries, getRowSelectionKeys } from '~/utils/common';

const toolsWithSizeAndDateSelect = new Set<string>([
  Tools.DuplicateFiles,
  Tools.SimilarImages,
  Tools.SimilarVideos,
  Tools.MusicDuplicates,
]);

export function RowSelectionMenu(props: { disabled: boolean }) {
  const { disabled } = props;

  const currentTool = useAtomValue(currentToolAtom);
  const currentToolData = useAtomValue(currentToolDataAtom);
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

function invertSelection<T extends BaseEntry & Partial<RefEntry>>(
  data: T[],
  setFn: (updater: (v: RowSelection) => RowSelection) => void,
) {
  const paths = getPathsFromEntries(data);
  setFn((old) => convertRowSelection(old, paths));
}

function convertRowSelection(old: RowSelection, paths: string[]): RowSelection {
  const selected = new Set(getRowSelectionKeys(old));
  const unselected = paths.filter((v) => !selected.has(v));
  const result = pathsToRowSelection(unselected);
  return result;
}

function pathsToRowSelection(paths: string[]): RowSelection {
  const obj = Object.fromEntries(
    paths.map((v) => {
      return [v, true];
    }),
  );
  return obj;
}

function groupBy<T extends RefEntry>(list: T[]): T[][] {
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

interface WithRaw {
  raw: Record<string, any>;
}

function selectItem<T extends BaseEntry & RefEntry & WithRaw>(
  data: T[],
  type: 'size' | 'date' | 'resolution',
  dir: 'asc' | 'desc',
): RowSelection {
  const paths: string[] = [];
  let compareFn: (<T extends WithRaw>(a: T, b: T) => T) | null = null;
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

function pickBiggest<T extends WithRaw>(a: T, b: T): T {
  return a.raw.size >= b.raw.size ? a : b;
}

function pickSmallest<T extends WithRaw>(a: T, b: T): T {
  return a.raw.size <= b.raw.size ? a : b;
}

function pickNewst<T extends WithRaw>(a: T, b: T): T {
  return a.raw.modified_date >= b.raw.modified_date ? a : b;
}

function pickOldest<T extends WithRaw>(a: T, b: T): T {
  return a.raw.modified_date <= b.raw.modified_date ? a : b;
}

function pickHighestResolution<T extends WithRaw>(a: T, b: T): T {
  return a.raw.width * a.raw.height >= b.raw.width * b.raw.height ? a : b;
}

function pickLowestResolution<T extends WithRaw>(a: T, b: T): T {
  return a.raw.width * a.raw.height <= b.raw.width * b.raw.height ? a : b;
}
