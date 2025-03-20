import { useAtom, useSetAtom } from 'jotai';
import { TextCursorInput } from 'lucide-react';
import { logsAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { OneAlertDialog } from '~/components/one-alert-dialog';
import { useBoolean, useListenEffect } from '~/hooks';
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
        <TextCursorInput />
        Rename
      </OperationButton>
      <OneAlertDialog
        open={open.value}
        onOpenChange={handleOpenChange}
        title="Renaming files"
        okLoading={loading.value}
        description={
          <span>
            This will rename extensions of selected
            <span className="text-primary p-1">{paths.length}</span> files to
            more proper. Are you want to continue?
          </span>
        }
        onOk={handleOk}
      />
    </>
  );
}
