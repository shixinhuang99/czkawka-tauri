import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtomValue, useSetAtom } from 'jotai';
import { FileJson } from 'lucide-react';
import { currentToolAtom, logsAtom } from '~/atom/primitive';
import { currentToolDataAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { OneAlertDialog } from '~/components/one-alert-dialog';
import { useBoolean, useListenEffect } from '~/hooks';
import { ipc } from '~/ipc';

interface SaveResultProps {
  disabled: boolean;
}

export function SaveResult(props: SaveResultProps) {
  const { disabled } = props;

  const open = useBoolean();
  const loading = useBoolean();
  const currentTool = useAtomValue(currentToolAtom);
  const currentToolData = useAtomValue(currentToolDataAtom);
  const setLogs = useSetAtom(logsAtom);

  useListenEffect('save-result-done', (v: string) => {
    loading.off();
    open.off();
    setLogs(v);
  });

  const handleOpenChange = (v: boolean) => {
    if (loading.value) {
      return;
    }
    open.set(v);
  };

  const handleOk = async () => {
    if (loading.value) {
      return;
    }
    const dir = await openFileDialog({ multiple: false, directory: true });
    if (!dir) {
      open.off();
      return;
    }
    ipc.saveResult({ currentTool, destination: dir });
    loading.on();
  };

  return (
    <>
      <OperationButton
        disabled={disabled || !currentToolData.length}
        onClick={open.on}
      >
        <FileJson />
        Save
      </OperationButton>
      <OneAlertDialog
        open={open.value}
        onOpenChange={handleOpenChange}
        title="Saving results"
        okLoading={loading.value}
        description={
          <span>
            This will save results to 3 different files. Are you want to
            continue?
          </span>
        }
        onOk={handleOk}
      />
    </>
  );
}
