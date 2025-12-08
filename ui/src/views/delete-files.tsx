import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { currentToolAtom, logsAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { Tools } from '~/consts';
import { useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';
import { is2DArray } from '~/utils/common';
import { getRowSelectionKeys } from '~/utils/table-helper';

interface DeleteFilesProps {
  disabled: boolean;
}

interface DeleteFilesResult {
  successPaths: string[];
  errors: string[];
}

export function DeleteFiles({ disabled }: DeleteFilesProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const setLogs = useSetAtom(logsAtom);
  const settings = useAtomValue(settingsAtom);
  const currentTool = useAtomValue(currentToolAtom);
  const [currentToolData, setCurrentToolData] = useAtom(currentToolDataAtom);
  const [currentToolRowSelection, setCurrentToolRowSelection] = useAtom(
    currentToolRowSelectionAtom,
  );
  const t = useT();

  useListenEffect('delete-files-result', (result: DeleteFilesResult) => {
    setLoading(false);
    setOpen(false);
    const { successPaths, errors } = result;
    setLogs(
      [`Successfully deleted ${successPaths.length} files`, ...errors].join(
        '\n',
      ),
    );
    const set = new Set(successPaths);
    const newData = is2DArray(currentToolData)
      ? currentToolData.map((item) => {
          return item.filter((v) => !set.has(v.path));
        })
      : currentToolData.filter((v) => !set.has(v.path));
    setCurrentToolData(newData);
    setCurrentToolRowSelection({});
  });

  const paths = getRowSelectionKeys(currentToolRowSelection);

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
    ipc.deleteFiles({
      paths,
      moveDeletedFilesToTrash: settings.moveDeletedFilesToTrash,
      isEmptyFoldersTool: currentTool === Tools.EmptyFolders,
    });
  };

  return (
    <>
      <OperationButton
        disabled={disabled || !paths.length}
        onClick={() => setOpen(true)}
      >
        <Trash2Icon />
        {t('delete')}
      </OperationButton>
      <AlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t('deleteItems')}
        okLoading={loading}
        description={
          <span>
            <Trans i18nKey="deleteComfirm" values={{ length: paths.length }}>
              Are you sure you want to delete the selected
              <span className="text-primary p-1" /> items?
            </Trans>
          </span>
        }
        onOk={handleOk}
      />
    </>
  );
}
