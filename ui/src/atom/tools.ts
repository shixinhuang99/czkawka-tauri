import { atom, type PrimitiveAtom } from 'jotai';
import type {
  RowSelection,
  SortingStateUpdater,
} from '~/components/data-table';
import { Tools } from '~/consts';
import type { ToolsValues } from '~/types';
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
  progressAtom,
  similarImagesAtom,
  similarImagesRowSelectionAtom,
  similarVideosAtom,
  similarVideosRowSelectionAtom,
  sortingAtom,
  temporaryFilesAtom,
  temporaryFilesRowSelectionAtom,
} from './primitive';

const dataAtomMap: Record<ToolsValues, PrimitiveAtom<any[]>> = {
  [Tools.DuplicateFiles]: duplicateFilesAtom,
  [Tools.EmptyFolders]: emptyFoldersAtom,
  [Tools.BigFiles]: bigFilesAtom,
  [Tools.EmptyFiles]: emptyFilesAtom,
  [Tools.TemporaryFiles]: temporaryFilesAtom,
  [Tools.SimilarImages]: similarImagesAtom,
  [Tools.SimilarVideos]: similarVideosAtom,
  [Tools.MusicDuplicates]: musicDuplicatesAtom,
  [Tools.InvalidSymlinks]: invalidSymlinksAtom,
  [Tools.BrokenFiles]: brokenFilesAtom,
  [Tools.BadExtensions]: badExtensionsAtom,
};

const rowSelectionAtomMap: Record<ToolsValues, PrimitiveAtom<RowSelection>> = {
  [Tools.DuplicateFiles]: duplicateFilesRowSelectionAtom,
  [Tools.EmptyFolders]: emptyFoldersRowSelectionAtom,
  [Tools.BigFiles]: bigFilesRowSelectionAtom,
  [Tools.EmptyFiles]: emptyFilesRowSelectionAtom,
  [Tools.TemporaryFiles]: temporaryFilesRowSelectionAtom,
  [Tools.SimilarImages]: similarImagesRowSelectionAtom,
  [Tools.SimilarVideos]: similarVideosRowSelectionAtom,
  [Tools.MusicDuplicates]: musicDuplicatesRowSelectionAtom,
  [Tools.InvalidSymlinks]: invalidSymlinksRowSelectionAtom,
  [Tools.BrokenFiles]: brokenFilesRowSelectionAtom,
  [Tools.BadExtensions]: badExtensionsRowSelectionAtom,
};

export const currentToolDataAtom = atom(
  (get) => {
    const currentTool = get(currentToolAtom);
    const targetAtom = dataAtomMap[currentTool];
    return get(targetAtom);
  },
  (get, set, v: any[]) => {
    const currentTool = get(currentToolAtom);
    const targetAtom = dataAtomMap[currentTool];
    set(targetAtom, v);
  },
);

type Updater = RowSelection | ((v: RowSelection) => RowSelection);

export const currentToolRowSelectionAtom = atom(
  (get) => {
    const currentTool = get(currentToolAtom);
    const targetAtom = rowSelectionAtomMap[currentTool];
    return get(targetAtom);
  },
  (get, set, updater: Updater) => {
    const currentTool = get(currentToolAtom);
    const targetAtom = rowSelectionAtomMap[currentTool];
    set(targetAtom, updater);
  },
);

export const toolInProgressDataAtom = atom(
  (get) => {
    const progress = get(progressAtom);
    if (!progress.tool) {
      return null;
    }
    const targetAtom = dataAtomMap[progress.tool];
    return get(targetAtom);
  },
  (get, set, v: any[]) => {
    const progress = get(progressAtom);
    if (!progress.tool) {
      return;
    }
    const targetAtom = dataAtomMap[progress.tool];
    set(targetAtom, v);
  },
);

export const toolInProgressRowSelectionAtom = atom(
  (get) => {
    const progress = get(progressAtom);
    if (!progress.tool) {
      return null;
    }
    const targetAtom = rowSelectionAtomMap[progress.tool];
    return get(targetAtom);
  },
  (get, set, updater: Updater) => {
    const progress = get(progressAtom);
    if (!progress.tool) {
      return;
    }
    const targetAtom = rowSelectionAtomMap[progress.tool];
    set(targetAtom, updater);
  },
);

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
