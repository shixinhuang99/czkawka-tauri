import { useAtom, useSetAtom } from 'jotai';
import { TextCursorInputIcon } from 'lucide-react';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { logsAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';
import { is2DArray } from '~/utils/common';
import { getRowSelectionKeys } from '~/utils/table-helper';

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
  const [currentToolData, setCurrentToolData] = useAtom(currentToolDataAtom);
  const [currentToolRowSelection, setCurrentToolRowSelection] = useAtom(
    currentToolRowSelectionAtom,
  );
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
    ipc.renameExt({
      items: is2DArray(currentToolData)
        ? currentToolData.flatMap((item) =>
            item.map((v) => ({
              path: v.path,
              ext: v.rawData.proper_extension,
            })),
          )
        : currentToolData.map((v) => {
            return { path: v.path, ext: v.rawData.proper_extension };
          }),
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
