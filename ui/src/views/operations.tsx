import { useAtomValue } from 'jotai';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { currentToolDataAtom } from '~/atom/tools';
import { Tools } from '~/consts';
import { DeleteFiles } from './delete-files';
import { MoveFiles } from './move-files';
import { RenameExt } from './rename-ext';
import { RowSelectionMenu } from './row-selection-menu';
import { SaveResult } from './save-result';
import { ScanButton } from './scan-button';

export function Operations() {
  const progress = useAtomValue(progressAtom);
  const currentToolData = useAtomValue(currentToolDataAtom);
  const currentTool = useAtomValue(currentToolAtom);

  const disabled = !!progress.tool || !currentToolData.length;

  return (
    <div className="flex gap-1">
      <ScanButton />
      <RowSelectionMenu disabled={disabled} />
      <MoveFiles disabled={disabled} />
      <DeleteFiles disabled={disabled} />
      <SaveResult disabled={disabled} />
      {currentTool === Tools.BadExtensions && <RenameExt disabled={disabled} />}
    </div>
  );
}
