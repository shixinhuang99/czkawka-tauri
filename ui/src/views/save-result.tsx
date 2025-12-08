import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtomValue, useSetAtom } from 'jotai';
import { FileJsonIcon } from 'lucide-react';
import { useState } from 'react';
import { currentToolAtom, logsAtom } from '~/atom/primitive';
import { currentToolDataAtom } from '~/atom/tools';
import { OperationButton } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';

interface SaveResultProps {
  disabled: boolean;
}

export function SaveResult({ disabled }: SaveResultProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentTool = useAtomValue(currentToolAtom);
  const currentToolData = useAtomValue(currentToolDataAtom);
  const setLogs = useSetAtom(logsAtom);
  const t = useT();

  useListenEffect('save-result-done', (v: string) => {
    setLoading(false);
    setOpen(false);
    setLogs(v);
  });

  const handleOpenChange = (v: boolean) => {
    if (loading) {
      return;
    }
    setOpen(v);
  };

  const handleOk = async () => {
    if (loading) {
      return;
    }
    const dir = await openFileDialog({ multiple: false, directory: true });
    if (!dir) {
      setOpen(false);
      return;
    }
    ipc.saveResult({ currentTool, destination: dir });
    setLoading(true);
  };

  return (
    <>
      <OperationButton
        disabled={disabled || !currentToolData.length}
        onClick={() => setOpen(true)}
      >
        <FileJsonIcon />
        {t('save')}
      </OperationButton>
      <AlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t('savingResults')}
        okLoading={loading}
        description={<span>{t('saveConfirm')}</span>}
        onOk={handleOk}
      />
    </>
  );
}
