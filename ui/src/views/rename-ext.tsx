import { useAtom, useSetAtom } from 'jotai';
import { TextCursorInputIcon } from 'lucide-react';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { logsAtom } from '~/atom/primitive';
import { currentRowSelectionAtom, currentTableDataAtom } from '~/atom/table';
import { OperationButton } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';
import { is2DArray } from '~/utils/common';
import {
  getRowSelectionKeys,
  removeTableDataItemsByPaths,
} from '~/utils/table-helper';

interface RenameExtProps {
  disabled: boolean;
}

interface RenameExtResult {
  successPaths: string[];
  errors: string[];
}

export function RenameExt({ disabled }: RenameExtProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const setLogs = useSetAtom(logsAtom);
  const [tableData, setTableData] = useAtom(currentTableDataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentRowSelectionAtom);
  const t = useT();

  useListenEffect('rename-ext-result', (result: RenameExtResult) => {
    setLoading(false);
    setOpen(false);
    const { successPaths, errors } = result;
    setLogs(
      [`Successfully renamed ${successPaths.length} files`, ...errors].join(
        '\n',
      ),
    );
    if (successPaths.length) {
      setTableData((oldTableData) =>
        removeTableDataItemsByPaths(oldTableData, successPaths),
      );
    }
    setRowSelection({});
  });

  const paths = getRowSelectionKeys(rowSelection);

  const handleOpenChange = (v: boolean) => {
    if (loading) {
      return;
    }
    setOpen(v);
  };

  const handleOk = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const pathsSet = new Set(paths);
    const selectedItems = is2DArray(tableData)
      ? tableData.flatMap((group) =>
          group.filter((item) => pathsSet.has(item.path)),
        )
      : tableData.filter((item) => pathsSet.has(item.path));

    ipc.renameExt({
      items: selectedItems.map((item) => ({
        path: item.path,
        ext: item.rawData.proper_extension,
      })),
    });
  };

  return (
    <>
      <OperationButton
        disabled={disabled || !paths.length}
        onClick={() => setOpen(true)}
      >
        <TextCursorInputIcon />
        {t('rename')}
      </OperationButton>
      <AlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t('renamingFiles')}
        okLoading={loading}
        description={
          <span>
            <Trans i18nKey="renameConfirm" values={{ length: paths.length }}>
              This will rename extensions of selected
              <span className="text-primary p-1" /> files to more proper. Are
              you want to continue?
            </Trans>
          </span>
        }
        onOk={handleOk}
      />
    </>
  );
}
