import { type PrimitiveAtom, atom } from 'jotai';
import type { RowSelection } from '~/components/data-table';
import { Tools } from '~/consts';
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
} from './primitive';

const dataAtomMap: Record<string, PrimitiveAtom<any[]>> = {
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

const rowSelectionAtomMap: Record<string, PrimitiveAtom<RowSelection>> = {
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
