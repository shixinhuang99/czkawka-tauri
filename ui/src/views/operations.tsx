import { useAtomValue } from 'jotai';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { currentTableDataAtom } from '~/atom/table';
import { Tools } from '~/consts';
import { DeleteFiles } from './delete-files';
import { MoveFiles } from './move-files';
import { RenameExt } from './rename-ext';
import { SelectionMenu } from './row-selection-menu';
import { SaveResult } from './save-result';
import { ScanButton } from './scan-button';

export function Operations() {
  const progress = useAtomValue(progressAtom);
  const tableData = useAtomValue(currentTableDataAtom);
  const currentTool = useAtomValue(currentToolAtom);

  const disabled = !!progress.tool || !tableData.length;

  return (
    <div className="flex gap-1">
      <ScanButton />
      <SelectionMenu disabled={disabled} />
      <MoveFiles disabled={disabled} />
      <DeleteFiles disabled={disabled} />
      <SaveResult disabled={disabled} />
      {currentTool === Tools.BadExtensions && <RenameExt disabled={disabled} />}
    </div>
  );
}
