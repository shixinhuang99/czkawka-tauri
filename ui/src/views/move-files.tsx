import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtom, useSetAtom } from 'jotai';
import { FolderSymlinkIcon, LoaderCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { logsAtom } from '~/atom/primitive';
import { currentRowSelectionAtom, currentTableDataAtom } from '~/atom/table';
import { OperationButton, Switch } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { Form, FormItem } from '~/components/form';
import { useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';
import {
  getRowSelectionKeys,
  removeTableDataItemsByPaths,
} from '~/utils/table-helper';

interface MoveFilesProps {
  disabled: boolean;
}

interface Options {
  copyMode: boolean;
  preserveStructure: boolean;
  overrideMode: boolean;
}

interface MoveFilesResult {
  successPaths: string[];
  errors: string[];
}

function getDefaultOptions(): Options {
  return {
    copyMode: false,
    preserveStructure: false,
    overrideMode: false,
  };
}

export function MoveFiles({ disabled }: MoveFilesProps) {
  const [destination, setDestination] = useState('');
  const [options, setOptions] = useState<Options>(getDefaultOptions);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFileDialogLoading, setOpenFileDialogLoading] = useState(false);
  const setLogs = useSetAtom(logsAtom);
  const setTableData = useSetAtom(currentTableDataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentRowSelectionAtom);
  const t = useT();

  useListenEffect('move-files-result', (result: MoveFilesResult) => {
    setLoading(false);
    setOpen(false);
    setOptions(getDefaultOptions());
    const { successPaths, errors } = result;
    setLogs(
      [
        `Successfully moved or copied ${successPaths.length} files`,
        ...errors,
      ].join('\n'),
    );
    if (!options.copyMode) {
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
    setOptions(getDefaultOptions());
    setOpen(v);
  };

  const handleChooseDestination = async () => {
    setOpenFileDialogLoading(true);
    const dir = await openFileDialog({ multiple: false, directory: true });
    setOpenFileDialogLoading(false);
    if (!dir) {
      return;
    }
    setDestination(dir);
    setOpen(true);
  };

  const handleOk = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    ipc.moveFiles({ paths, destination, ...options });
  };

  return (
    <>
      <OperationButton
        disabled={disabled || !paths.length}
        onClick={handleChooseDestination}
      >
        {openFileDialogLoading ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <FolderSymlinkIcon />
        )}
        {t('move')}
      </OperationButton>
      <AlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t('movingFiles')}
        okLoading={loading}
        description={
          <span>
            <Trans
              i18nKey="moveConfirm"
              values={{ length: paths.length, destination }}
            >
              Moving
              <span className="text-primary" />
              entries to folder
              <span className="text-primary p-1" />. Are you want to continue?
            </Trans>
          </span>
        }
        onOk={handleOk}
      >
        <Form
          value={options}
          onChange={(v) => setOptions({ ...options, ...v })}
        >
          <FormItem
            name="copyMode"
            label={t('copyFilesInsteadOfMoving')}
            comp="switch"
          >
            <Switch />
          </FormItem>
          <FormItem
            name="preserveStructure"
            label={t('preserveFolderStructure')}
            comp="switch"
          >
            <Switch />
          </FormItem>
          <FormItem
            name="overrideMode"
            label={t('overrideFiles')}
            comp="switch"
          >
            <Switch />
          </FormItem>
        </Form>
      </AlertDialog>
    </>
  );
}
