import { useAtomValue } from 'jotai';
import { progressAtom } from '~/atom/primitive';
import { currentToolDataAtom } from '~/atom/tools';
import { DeleteFiles } from './delete-files';
import { MoveFiles } from './move-files';
import { RowSelectionMenu } from './row-selection-menu';
import { SaveResult } from './save-result';
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
      <MoveFiles disabled={disabled} />
      <DeleteFiles disabled={disabled} />
      <SaveResult disabled={disabled} />
    </div>
  );
}
