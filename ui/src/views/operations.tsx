import { useAtomValue } from 'jotai';
import { FolderLock, FolderSymlink, Trash2 } from 'lucide-react';
import { bigFilesAtom, currentToolAtom, progressAtom } from '~/atom/primitive';
import { OperationButton } from '~/components';
import { Tools } from '~/consts';
import { RowSelectionMenu } from './row-selection-menu';
import { ScanButton } from './scan-button';
import { ToolSettings } from './tool-settings';

export function Operations() {
  const currentTool = useAtomValue(currentToolAtom);
  const progress = useAtomValue(progressAtom);
  const bigFiles = useAtomValue(bigFilesAtom);

  const disabled = (() => {
    let base = !!progress.tool;
    if (currentTool === Tools.BigFiles) {
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
