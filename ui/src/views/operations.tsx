import { useAtomValue } from 'jotai';
import { FolderLock, Trash2 } from 'lucide-react';
import { progressAtom } from '~/atom/primitive';
import { currentToolDataAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { MoveOperation } from './move-operation';
import { RowSelectionMenu } from './row-selection-menu';
import { ScanButton } from './scan-button';
import { ToolSettings } from './tool-settings';

export function Operations() {
  const progress = useAtomValue(progressAtom);
  const currentToolData = useAtomValue(currentToolDataAtom);
  const disabled = !!progress.tool || !currentToolData.length;

  return (
    <div className="flex gap-1">
      <ScanButton />
      <ToolSettings />
      <RowSelectionMenu disabled={disabled} />
      <MoveOperation disabled={disabled} />
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
