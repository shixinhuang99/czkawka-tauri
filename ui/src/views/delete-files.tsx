import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Trash2 } from 'lucide-react';
import { Trans } from 'react-i18next';
import { currentToolAtom, logsAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { Tools } from '~/consts';
import { useBoolean, useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';
import { getRowSelectionKeys } from '~/utils/common';

interface DeleteFilesProps {
  disabled: boolean;
}

interface DeleteFilesResult {
  successPaths: string[];
  errors: string[];
}

export function DeleteFiles(props: DeleteFilesProps) {
  const { disabled } = props;

  const open = useBoolean();
  const loading = useBoolean();
  const setLogs = useSetAtom(logsAtom);
  const settings = useAtomValue(settingsAtom);
  const currentTool = useAtomValue(currentToolAtom);
  const [currentToolData, setCurrentToolData] = useAtom(currentToolDataAtom);
  const [currentToolRowSelection, setCurrentToolRowSelection] = useAtom(
    currentToolRowSelectionAtom,
  );
  const t = useT();

  useListenEffect('delete-files-result', (result: DeleteFilesResult) => {
    loading.off();
    open.off();
    const { successPaths, errors } = result;
    setLogs(
      [`Successfully deleted ${successPaths.length} files`, ...errors].join(
        '\n',
      ),
    );
    const set = new Set(successPaths);
    const newData = currentToolData.filter((v) => !set.has(v.path));
    setCurrentToolData(newData);
    setCurrentToolRowSelection({});
  });

  const paths = getRowSelectionKeys(currentToolRowSelection);

  const handleOpenChange = (v: boolean) => {
    if (loading.value) {
      return;
    }
    open.set(v);
  };

  const handleOk = () => {
    if (loading.value) {
      return;
    }
    loading.on();
    ipc.deleteFiles({
      paths,
      moveDeletedFilesToTrash: settings.moveDeletedFilesToTrash,
      isEmptyFoldersTool: currentTool === Tools.EmptyFolders,
    });
  };

  return (
    <>
      <OperationButton disabled={disabled || !paths.length} onClick={open.on}>
        <Trash2 />
        {t('Delete')}
      </OperationButton>
      <AlertDialog
        open={open.value}
        onOpenChange={handleOpenChange}
        title={t('Delete items')}
        okLoading={loading.value}
        description={
          <span>
            <Trans i18nKey="Delete comfirm" values={{ length: paths.length }}>
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
