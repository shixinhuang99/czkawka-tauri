import type { RowSelectionState } from '@tanstack/react-table';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useSetAtom } from 'jotai';
import {
  FolderPenIcon,
  FolderPlusIcon,
  LoaderCircleIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { settingsAtom } from '~/atom/settings';
import { Button, Textarea, TooltipButton } from '~/components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/shadcn/dialog';
import { useT } from '~/hooks';
import type { DirsType } from '~/types';
import { splitStr } from '~/utils/common';
import { getRowSelectionKeys } from '~/utils/table-helper';

interface DirsActionsProps {
  field: DirsType;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (v: RowSelectionState) => void;
}

export function DirsActions({
  field,
  rowSelection,
  onRowSelectionChange,
}: DirsActionsProps) {
  const t = useT();
  const setSettings = useSetAtom(settingsAtom);
  const [manualAddDialogOpen, setManualAddDialogOpen] = useState(false);
  const [manualAddPaths, setManualAddPaths] = useState('');
  const [openFileDialogLoading, setOpenFileDialogLoading] = useState(false);
  const selected = new Set(getRowSelectionKeys(rowSelection));

  const handleRemovePaths = () => {
    if (!selected.size) {
      return;
    }
    setSettings((settings) => {
      return {
        ...settings,
        [field]: settings[field].filter((path) => !selected.has(path)),
      };
    });
    onRowSelectionChange({});
  };

  const handleAddPath = async () => {
    setOpenFileDialogLoading(true);
    const dir = await openFileDialog({ multiple: false, directory: true });
    setOpenFileDialogLoading(false);
    if (!dir) {
      return;
    }
    setSettings((settings) => {
      const dirs = settings[field];
      if (dirs.includes(dir)) {
        return settings;
      }
      return {
        ...settings,
        [field]: [dir, ...dirs],
      };
    });
  };

  const handleManualAddOk = () => {
    const paths = splitStr(manualAddPaths);
    setSettings((settings) => {
      return {
        ...settings,
        [field]: Array.from(new Set([...paths, ...settings[field]])),
      };
    });
    setManualAddDialogOpen(false);
  };

  return (
    <div>
      <TooltipButton tooltip={t('add')} onClick={handleAddPath}>
        {openFileDialogLoading ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <FolderPlusIcon />
        )}
      </TooltipButton>
      <Dialog
        open={manualAddDialogOpen}
        onOpenChange={(v) => {
          setManualAddPaths('');
          setManualAddDialogOpen(v);
        }}
      >
        <DialogTrigger asChild>
          <TooltipButton tooltip={t('manualAdd')}>
            <FolderPenIcon />
          </TooltipButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('manualAdd')}</DialogTitle>
            <DialogDescription>{t('manuallyAddPathsDesc')}</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={10}
            value={manualAddPaths}
            onChange={(e) => setManualAddPaths(e.target.value)}
            className="resize-none"
          />
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setManualAddDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleManualAddOk}>{t('ok')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TooltipButton
        tooltip={t('removeSelected')}
        onClick={handleRemovePaths}
        disabled={!selected.size}
      >
        <Trash2Icon />
      </TooltipButton>
    </div>
  );
}
