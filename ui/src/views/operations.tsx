import { useAtomValue } from 'jotai';
import { FolderLock, FolderSymlink, Trash2 } from 'lucide-react';
import {
  bigFilesAtom,
  currentToolAtom,
  duplicateFilesAtom,
  emptyFoldersAtom,
  progressAtom,
} from '~/atom/primitive';
import { OperationButton } from '~/components';
import { Tools } from '~/consts';
import { RowSelectionMenu } from './row-selection-menu';
import { ScanButton } from './scan-button';
import { ToolSettings } from './tool-settings';

export function Operations() {
  const currentTool = useAtomValue(currentToolAtom);
  const progress = useAtomValue(progressAtom);
  const bigFiles = useAtomValue(bigFilesAtom);
  const duplicateFiles = useAtomValue(duplicateFilesAtom);
  const emptyFolders = useAtomValue(emptyFoldersAtom);

  const disabled = (() => {
    let base = !!progress.tool;
    if (currentTool === Tools.DuplicateFiles) {
      base ||= !duplicateFiles.length;
    } else if (currentTool === Tools.EmptyFolders) {
      base ||= !emptyFolders.length;
    } else if (currentTool === Tools.BigFiles) {
      base ||= !bigFiles.length;
    }
    return base;
  })();

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
