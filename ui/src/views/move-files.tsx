import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtom, useSetAtom } from 'jotai';
import { FolderSymlink } from 'lucide-react';
import { useState } from 'react';
import { logsAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { OperationButton, Switch } from '~/components';
import { OneAlertDialog } from '~/components/one-alert-dialog';
import { Form, FormItem } from '~/components/simple-form';
import { useBoolean, useListenEffect } from '~/hooks';
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
  const setLogs = useSetAtom(logsAtom);
  const [currentToolData, setCurrentToolData] = useAtom(currentToolDataAtom);
  const [currentToolRowSelection, setCurrentToolRowSelection] = useAtom(
    currentToolRowSelectionAtom,
  );

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
    const dir = await openFileDialog({ multiple: false, directory: true });
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
        <FolderSymlink />
        Move
      </OperationButton>
      <OneAlertDialog
        open={open.value}
        onOpenChange={handleOpenChange}
        title="Moving files"
        okLoading={loading.value}
        description={
          <span>
            Moving <span className="text-primary">{paths.length}</span> entries
            to folder
            <span className="text-primary p-1">{destination}</span>. Are you
            want to continue?
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
            label="Copy files instead of moving"
            comp="switch"
          >
            <Switch />
          </FormItem>
          <FormItem
            name="preserveStructure"
            label="Preserve folder structure"
            comp="switch"
          >
            <Switch />
          </FormItem>
          <FormItem name="overrideMode" label="Override files" comp="switch">
            <Switch />
          </FormItem>
        </Form>
      </OneAlertDialog>
    </>
  );
}
