import { useAtomValue, useSetAtom } from 'jotai';
import { SquareMousePointer } from 'lucide-react';
import {
  badExtensionsAtom,
  badExtensionsRowSelectionAtom,
  bigFilesAtom,
  bigFilesRowSelectionAtom,
  brokenFilesAtom,
  brokenFilesRowSelectionAtom,
  currentToolAtom,
  duplicateFilesAtom,
  duplicateFilesRowSelectionAtom,
  emptyFilesAtom,
  emptyFilesRowSelectionAtom,
  emptyFoldersAtom,
  emptyFoldersRowSelectionAtom,
  invalidSymlinksAtom,
  invalidSymlinksRowSelectionAtom,
  musicDuplicatesAtom,
  musicDuplicatesRowSelectionAtom,
  similarImagesAtom,
  similarImagesRowSelectionAtom,
  similarVideosAtom,
  similarVideosRowSelectionAtom,
  temporaryFilesAtom,
  temporaryFilesRowSelectionAtom,
} from '~/atom/primitive';
import { OperationButton } from '~/components';
import type { RowSelection } from '~/components/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/shadcn/dropdown-menu';
import { Tools } from '~/consts';
import type { BaseEntry, RefEntry } from '~/types';
import {
  getPathsFromEntries,
  getPathsFromRefEntries,
  getRowSelectionKeys,
} from '~/utils/common';

interface RowSelectionMenuProps {
  disabled: boolean;
}

const toolsWithSizeAndDateSelect = new Set<string>([
  Tools.DuplicateFiles,
  Tools.SimilarImages,
  Tools.SimilarVideos,
  Tools.MusicDuplicates,
]);

export function RowSelectionMenu(props: RowSelectionMenuProps) {
  const { disabled } = props;

  const currentTool = useAtomValue(currentToolAtom);

  const duplicateFiles = useAtomValue(duplicateFilesAtom);
  const emptyFolders = useAtomValue(emptyFoldersAtom);
  const bigFiles = useAtomValue(bigFilesAtom);
  const emptyFiles = useAtomValue(emptyFilesAtom);
  const temporaryFiles = useAtomValue(temporaryFilesAtom);
  const similarImages = useAtomValue(similarImagesAtom);
  const similarVideos = useAtomValue(similarVideosAtom);
  const musicDuplicates = useAtomValue(musicDuplicatesAtom);
  const invalidSymlinks = useAtomValue(invalidSymlinksAtom);
  const brokenFiles = useAtomValue(brokenFilesAtom);
  const badExtensions = useAtomValue(badExtensionsAtom);

  const setDuplicateFilesRowSelection = useSetAtom(
    duplicateFilesRowSelectionAtom,
  );
  const setEmptyFoldersRowSelection = useSetAtom(emptyFoldersRowSelectionAtom);
  const setBigFilesRowSelection = useSetAtom(bigFilesRowSelectionAtom);
  const setEmptyFilesRowSelection = useSetAtom(emptyFilesRowSelectionAtom);
  const setTemporaryFilesRowSelection = useSetAtom(
    temporaryFilesRowSelectionAtom,
  );
  const setSimilarImagesRowSelection = useSetAtom(
    similarImagesRowSelectionAtom,
  );
  const setSimilarVideosRowSelection = useSetAtom(
    similarVideosRowSelectionAtom,
  );
  const setMusicDuplicatesRowSelection = useSetAtom(
    musicDuplicatesRowSelectionAtom,
  );
  const setInvalidSymlinksRowSelection = useSetAtom(
    invalidSymlinksRowSelectionAtom,
  );
  const setBrokenFilesRowSelection = useSetAtom(brokenFilesRowSelectionAtom);
  const setBadExtensionsRowSelection = useSetAtom(
    badExtensionsRowSelectionAtom,
  );

  const handleInvertSelection = () => {
    if (currentTool === Tools.DuplicateFiles) {
      invertRefSelection(duplicateFiles, setDuplicateFilesRowSelection);
    } else if (currentTool === Tools.EmptyFolders) {
      invertSelection(emptyFolders, setEmptyFoldersRowSelection);
    } else if (currentTool === Tools.BigFiles) {
      invertSelection(bigFiles, setBigFilesRowSelection);
    } else if (currentTool === Tools.EmptyFiles) {
      invertSelection(emptyFiles, setEmptyFilesRowSelection);
    } else if (currentTool === Tools.TemporaryFiles) {
      invertSelection(temporaryFiles, setTemporaryFilesRowSelection);
    } else if (currentTool === Tools.SimilarImages) {
      invertRefSelection(similarImages, setSimilarImagesRowSelection);
    } else if (currentTool === Tools.SimilarVideos) {
      invertRefSelection(similarVideos, setSimilarVideosRowSelection);
    } else if (currentTool === Tools.MusicDuplicates) {
      invertRefSelection(musicDuplicates, setMusicDuplicatesRowSelection);
    } else if (currentTool === Tools.InvalidSymlinks) {
      invertSelection(invalidSymlinks, setInvalidSymlinksRowSelection);
    } else if (currentTool === Tools.BrokenFiles) {
      invertSelection(brokenFiles, setBrokenFilesRowSelection);
    } else if (currentTool === Tools.BadExtensions) {
      invertSelection(badExtensions, setBadExtensionsRowSelection);
    }
  };

  const handleSelectXXX = (
    type: 'size' | 'date' | 'resolution',
    dir: 'asc' | 'desc',
  ) => {
    if (currentTool === Tools.DuplicateFiles) {
      setDuplicateFilesRowSelection(selectItem(duplicateFiles, type, dir));
    } else if (currentTool === Tools.SimilarImages) {
      setSimilarImagesRowSelection(selectItem(similarImages, type, dir));
    } else if (currentTool === Tools.SimilarVideos) {
      setSimilarVideosRowSelection(selectItem(similarVideos, type, dir));
    } else if (currentTool === Tools.MusicDuplicates) {
      setMusicDuplicatesRowSelection(selectItem(musicDuplicates, type, dir));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <OperationButton disabled={disabled}>
          <SquareMousePointer />
          Select
        </OperationButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        {currentTool === Tools.SimilarImages && (
          <>
            <DropdownMenuItem
              onClick={() => handleSelectXXX('resolution', 'asc')}
            >
              Select the highest resolution
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSelectXXX('resolution', 'desc')}
            >
              Select the lowest resolution
            </DropdownMenuItem>
          </>
        )}
        {toolsWithSizeAndDateSelect.has(currentTool) && (
          <>
            <DropdownMenuItem onClick={() => handleSelectXXX('size', 'asc')}>
              Select the biggest size
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectXXX('size', 'desc')}>
              Select the smallest size
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectXXX('date', 'asc')}>
              Select the newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectXXX('date', 'desc')}>
              Select the oldest
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleInvertSelection}>
          Invert selection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function invertSelection<T extends BaseEntry>(
  data: T[],
  setFn: (updater: (v: RowSelection) => RowSelection) => void,
) {
  const paths = getPathsFromEntries(data);
  setFn((old) => convertRowSelection(old, paths));
}

function invertRefSelection<T extends BaseEntry & RefEntry>(
  data: T[],
  setFn: (updater: (v: RowSelection) => RowSelection) => void,
) {
  const paths = getPathsFromRefEntries(data);
  setFn((old) => convertRowSelection(old, paths));
}

function convertRowSelection(old: RowSelection, paths: string[]): RowSelection {
  const selected = getRowSelectionKeys(old);
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
