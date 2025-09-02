import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtom, useSetAtom } from 'jotai';
import { FolderSymlink, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { logsAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton, Switch } from '~/components';
import { AlertDialog } from '~/components/alert-dialog';
import { Form, FormItem } from '~/components/simple-form';
import { useBoolean, useListenEffect, useT } from '~/hooks';
import { ipc } from '~/ipc';
import { getRowSelectionKeys } from '~/utils/common';

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

const getDefaultOptions = (): Options => {
  return {
    copyMode: false,
    preserveStructure: false,
    overrideMode: false,
  };
};

export function MoveFiles(props: MoveFilesProps) {
  const { disabled } = props;

  const [destination, setDestination] = useState('');
  const [options, setOptions] = useState<Options>(getDefaultOptions());
  const open = useBoolean();
  const loading = useBoolean();
  const openFileDialogLoading = useBoolean();
  const setLogs = useSetAtom(logsAtom);
  const [currentToolData, setCurrentToolData] = useAtom(currentToolDataAtom);
  const [currentToolRowSelection, setCurrentToolRowSelection] = useAtom(
    currentToolRowSelectionAtom,
  );
  const t = useT();

  useListenEffect('move-files-result', (result: MoveFilesResult) => {
    loading.off();
    open.off();
    setOptions(getDefaultOptions());
    const { successPaths, errors } = result;
    setLogs(
      [
        `Successfully moved or copied ${successPaths.length} files`,
        ...errors,
      ].join('\n'),
    );
    if (!options.copyMode) {
      const set = new Set(successPaths);
      const newData = currentToolData.filter((v) => !set.has(v.path));
      setCurrentToolData(newData);
    }
    setCurrentToolRowSelection({});
  });

  const paths = getRowSelectionKeys(currentToolRowSelection);

  const handleOpenChange = (v: boolean) => {
    if (loading.value) {
      return;
    }
    setOptions(getDefaultOptions());
    open.set(v);
  };

  const handleChooseDestination = async () => {
    openFileDialogLoading.on();
    const dir = await openFileDialog({ multiple: false, directory: true });
    openFileDialogLoading.off();
    if (!dir) {
      return;
    }
    setDestination(dir);
    open.on();
  };

  const handleOk = () => {
    if (loading.value) {
      return;
    }
    loading.on();
    ipc.moveFiles({ paths, destination, ...options });
  };

  return (
    <>
      <OperationButton
        disabled={disabled || !paths.length}
        onClick={handleChooseDestination}
      >
        {openFileDialogLoading.value ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <FolderSymlink />
        )}
        {t('Move')}
      </OperationButton>
      <AlertDialog
        open={open.value}
        onOpenChange={handleOpenChange}
        title={t('Moving files')}
        okLoading={loading.value}
        description={
          <span>
            <Trans
              i18nKey="Move confirm"
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
            label={t('Copy files instead of moving')}
            comp="switch"
          >
            <Switch />
          </FormItem>
          <FormItem
            name="preserveStructure"
            label={t('Preserve folder structure')}
            comp="switch"
          >
            <Switch />
          </FormItem>
          <FormItem
            name="overrideMode"
            label={t('Override files')}
            comp="switch"
          >
            <Switch />
          </FormItem>
        </Form>
      </AlertDialog>
    </>
  );
}
