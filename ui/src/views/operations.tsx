import { useAtomValue } from 'jotai';
import { FolderLock, FolderSymlink, Trash2 } from 'lucide-react';
import {
  badExtensionsAtom,
  bigFilesAtom,
  brokenFilesAtom,
  currentToolAtom,
  duplicateFilesAtom,
  emptyFilesAtom,
  emptyFoldersAtom,
  invalidSymlinksAtom,
  musicDuplicatesAtom,
  progressAtom,
  similarImagesAtom,
  similarVideosAtom,
  temporaryFilesAtom,
} from '~/atom/primitive';
import { OperationButton } from '~/components';
import { Tools } from '~/consts';
import { RowSelectionMenu } from './row-selection-menu';
import { ScanButton } from './scan-button';
import { ToolSettings } from './tool-settings';

export function Operations() {
  const currentTool = useAtomValue(currentToolAtom);
  const progress = useAtomValue(progressAtom);

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

  const disabledMap: Record<string, boolean> = {
    [Tools.DuplicateFiles]: !duplicateFiles.length,
    [Tools.EmptyFolders]: !emptyFolders.length,
    [Tools.BigFiles]: !bigFiles.length,
    [Tools.EmptyFiles]: !emptyFiles.length,
    [Tools.TemporaryFiles]: !temporaryFiles.length,
    [Tools.SimilarImages]: !similarImages.length,
    [Tools.SimilarVideos]: !similarVideos.length,
    [Tools.MusicDuplicates]: !musicDuplicates.length,
    [Tools.InvalidSymlinks]: !invalidSymlinks.length,
    [Tools.BrokenFiles]: !brokenFiles.length,
    [Tools.BadExtensions]: !badExtensions.length,
  };

  const disabled = !!progress.tool || disabledMap[currentTool];

  return (
    <div className="flex gap-1">
      <ScanButton />
      <ToolSettings />
      <RowSelectionMenu disabled={disabled} />
      <OperationButton disabled={disabled}>
        <FolderSymlink />
        Move
      </OperationButton>
      <OperationButton disabled={disabled}>
        <Trash2 />
        Delete
      </OperationButton>
      <OperationButton disabled={disabled}>
        <FolderLock />
        Save
      </OperationButton>
    </div>
  );
}
