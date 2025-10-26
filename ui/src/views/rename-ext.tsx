import { useAtom, useSetAtom } from 'jotai';
import { TextCursorInputIcon } from 'lucide-react';
import { Trans } from 'react-i18next';
import { logsAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { useBoolean, useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';
import { getRowSelectionKeys } from '~/utils/common';

interface RenameExtProps {
  disabled: boolean;
}

interface RenameExtResult {
  successPaths: string[];
  errors: string[];
}

export function RenameExt(props: RenameExtProps) {
  const { disabled } = props;

  const open = useBoolean();
  const loading = useBoolean();
  const setLogs = useSetAtom(logsAtom);
  const [currentToolData, setCurrentToolData] = useAtom(currentToolDataAtom);
  const [currentToolRowSelection, setCurrentToolRowSelection] = useAtom(
    currentToolRowSelectionAtom,
  );
  const t = useT();

  useListenEffect('rename-ext-result', (result: RenameExtResult) => {
    loading.off();
    open.off();
    const { successPaths, errors } = result;
    setLogs(
      [`Successfully renamed ${successPaths.length} files`, ...errors].join(
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
    ipc.renameExt({
      items: currentToolData.map((v) => {
        return { path: v.path, ext: v.properExtension };
      }),
    });
  };

  return (
    <>
      <OperationButton disabled={disabled || !paths.length} onClick={open.on}>
        <TextCursorInputIcon />
        {t('rename')}
      </OperationButton>
      <AlertDialog
        open={open.value}
        onOpenChange={handleOpenChange}
        title={t('renamingFiles')}
        okLoading={loading.value}
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
