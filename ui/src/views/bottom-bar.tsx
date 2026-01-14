import type { Row, RowSelectionState, Table } from '@tanstack/react-table';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  FolderIcon,
  FolderPenIcon,
  FolderPlusIcon,
  LoaderCircleIcon,
  ScrollTextIcon,
  Settings2Icon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import {
  excludedDirsRowSelectionAtom,
  excludedDirsRowSortingAtom,
  includedDirsRowSelectionAtom,
  includedDirsRowSortingAtom,
  logsAtom,
} from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { Button, ScrollArea, Textarea, TooltipButton } from '~/components';
import {
  createColumns,
  createSortableColumnHeader,
  DataTable,
  type RowSelectionUpdater,
} from '~/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/shadcn/dialog';
import { Tabs, TabsList, TabsTrigger } from '~/components/shadcn/tabs';
import { useT } from '~/hooks';
import type { DirsType } from '~/types';
import { splitStr } from '~/utils/common';
import { getRowSelectionKeys } from '~/utils/table-helper';
import { Operations } from './operations';
import { ToolSettings } from './tool-settings';

const DisplayType = {
  Dirs: 'dirs',
  Logs: 'logs',
  ToolSettings: 'toolSettings',
} as const;

interface DirsData {
  path: string;
  field: DirsType;
  // useless just for type checking
  rawData: { path: string; [key: string]: any };
}

interface BottomBarProps {
  headerRef: React.RefObject<HTMLDivElement>;
}

export function BottomBar({ headerRef }: BottomBarProps) {
  const t = useT();
  const [displayType, setDisplayType] = useState<string>(DisplayType.Dirs);

  return (
    <div className="flex flex-col h-full px-2 py-1 gap-1">
      <div ref={headerRef} className="flex justify-between items-center">
        <Operations />
        <div className="flex items-center gap-1">
          <Tabs value={displayType} onValueChange={setDisplayType}>
            <TabsList>
              <TabsTrigger value={DisplayType.Dirs}>
                <FolderIcon />
                <span className="ml-2 select-none">{t('directories')}</span>
              </TabsTrigger>
              <TabsTrigger value={DisplayType.ToolSettings}>
                <Settings2Icon />
                <span className="ml-2 select-none">{t('toolSettings')}</span>
              </TabsTrigger>
              <TabsTrigger value={DisplayType.Logs}>
                <ScrollTextIcon />
                <span className="ml-2 select-none">{t('logs')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {displayType === DisplayType.Dirs && (
        <div className="flex gap-1 flex-1 min-h-0">
          <IncludedDirsTable />
          <ExcludedDirsTable />
        </div>
      )}
      {displayType === DisplayType.Logs && <Logs />}
      {displayType === DisplayType.ToolSettings && <ToolSettings />}
    </div>
  );
}

function IncludedDirsTable() {
  const t = useT();
  const [settings, setSettings] = useAtom(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(includedDirsRowSelectionAtom);
  const [sorting, setSorting] = useAtom(includedDirsRowSortingAtom);
  const data: DirsData[] = settings.includedDirectories.map((path) => {
    return {
      path,
      field: 'includedDirectories',
      rawData: {
        path,
      },
    };
  });

  const columns = createColumns<DirsData>(
    [
      {
        accessorKey: 'path',
        header: createSortableColumnHeader(t('path'), '-ml-4'),
        meta: {
          span: 10,
        },
      },
      {
        id: 'actions',
        meta: {
          span: 1,
        },
        cell: DirsRemoveButton,
      },
    ],
    { customActions: true, customSortableColumnHeader: true },
  );

  const handleRowSelectionChange = (updater: RowSelectionUpdater) => {
    setRowSelection(updater);
    const selectedKeys =
      typeof updater === 'function' ? updater(rowSelection) : updater;
    setSettings((old) => {
      return {
        ...old,
        includedDirectoriesReferenced: getRowSelectionKeys(selectedKeys),
      };
    });
  };

  return (
    <div className="w-1/2 flex flex-col">
      <div className="flex justify-between items-center">
        <SectionHeader>{t('includeDirectories')}</SectionHeader>
        <DirsActions
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          field="includedDirectories"
        />
      </div>
      <DataTable
        className="flex-1"
        data={data}
        columns={columns}
        emptyTip={t('pleaseAddPath')}
        layout="grid"
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}

function ExcludedDirsTable() {
  const t = useT();
  const settings = useAtomValue(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(excludedDirsRowSelectionAtom);
  const [sorting, setSorting] = useAtom(excludedDirsRowSortingAtom);
  const data: DirsData[] = settings.excludedDirectories.map((path) => {
    return {
      path,
      field: 'excludedDirectories',
      rawData: {
        path,
      },
    };
  });

  const columns = createColumns<DirsData>(
    [
      {
        accessorKey: 'path',
        header: createSortableColumnHeader(t('path'), '-ml-4'),
        meta: {
          span: 10,
        },
      },
      {
        id: 'actions',
        meta: {
          span: 1,
        },
        cell: DirsRemoveButton,
      },
    ],
    { customActions: true, customSortableColumnHeader: true },
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <SectionHeader>{t('excludeDirectories')}</SectionHeader>
        <DirsActions
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          field="excludedDirectories"
        />
      </div>
      <DataTable
        className="flex-1"
        data={data}
        columns={columns}
        emptyTip={t('pleaseAddPath')}
        layout="grid"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}

function DirsRemoveButton({
  row,
  table,
}: {
  row: Row<DirsData>;
  table: Table<DirsData>;
}) {
  const { path, field } = row.original;
  const setSettings = useSetAtom(settingsAtom);

  const handleRemovePath = () => {
    setSettings((settings) => {
      return {
        ...settings,
        [field]: settings[field].filter((v) => v !== path),
      };
    });
    table.setRowSelection((old) => {
      return Object.fromEntries(
        Object.entries(old).filter((obj) => obj[0] !== path),
      );
    });
  };

  return (
    <Button
      className="translate-x-[-8px]"
      variant="ghost"
      size="icon"
      onClick={handleRemovePath}
    >
      <Trash2Icon />
    </Button>
  );
}

interface DirsActionsProps {
  field: DirsType;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (v: RowSelectionState) => void;
}

function DirsActions({
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

function Logs() {
  const logs = useAtomValue(logsAtom);

  return (
    <ScrollArea className="flex-1 rounded-md border text-card-foreground px-2 py-1">
      <div className="whitespace-break-spaces">{logs}</div>
    </ScrollArea>
  );
}

function SectionHeader({ children }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground tracking-wider">
      {children}
    </h3>
  );
}
