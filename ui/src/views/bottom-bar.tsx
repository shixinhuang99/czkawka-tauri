import type { Table } from '@tanstack/react-table';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  FolderIcon,
  FolderPenIcon,
  FolderPlusIcon,
  LoaderCircleIcon,
  ScrollTextIcon,
  Trash2Icon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  excludedDirsRowSelectionAtom,
  includedDirsRowSelectionAtom,
  logsAtom,
} from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { Button, ScrollArea, Textarea, TooltipButton } from '~/components';
import {
  createColumns,
  DataTable,
  type RowSelection,
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
import { getRowSelectionKeys, splitStr } from '~/utils/common';
import { Operations } from './operations';

const DisplayType = {
  Dirs: 'dirs',
  Logs: 'logs',
} as const;

interface TableData {
  path: string;
  field: DirsType;
}

type PropsWithTable<T> = T & {
  table: Table<TableData>;
};

type PropsWithRowSelection<T> = T & {
  rowSelection: RowSelection;
  onRowSelectionChange: (v: RowSelection) => void;
};

interface BottomBarProps {
  headerRef: React.RefObject<HTMLDivElement>;
  panelSize: number;
}

export function BottomBar({ headerRef, panelSize }: BottomBarProps) {
  const [displayType, setDisplayType] = useState<string>(DisplayType.Dirs);

  const shouldShowContent = panelSize > 20;

  return (
    <div className="flex flex-col h-full px-2 py-1 gap-1">
      <div ref={headerRef} className="flex justify-between items-center">
        <Operations />
        <div className="flex items-center gap-1">
          <Tabs value={displayType} onValueChange={setDisplayType}>
            <TabsList>
              <TabsTrigger value={DisplayType.Dirs}>
                <FolderIcon />
              </TabsTrigger>
              <TabsTrigger value={DisplayType.Logs}>
                <ScrollTextIcon />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {shouldShowContent && (
        <>
          {displayType === DisplayType.Dirs && (
            <div className="flex gap-1 flex-1 min-h-0">
              <IncludedDirsTable />
              <ExcludedDirsTable />
            </div>
          )}
          {displayType === DisplayType.Logs && <Logs />}
        </>
      )}
    </div>
  );
}

function IncludedDirsTable() {
  const t = useT();
  const [settings, setSettings] = useAtom(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(includedDirsRowSelectionAtom);
  const data: TableData[] = useMemo(() => {
    return settings.includedDirectories.map((path) => {
      return {
        path,
        field: 'includedDirectories',
      };
    });
  }, [settings]);

  const columns = createColumns<TableData>([
    {
      accessorKey: 'path',
      header: t('path'),
      meta: {
        span: 10,
      },
    },
    {
      id: 'actions',
      meta: {
        span: 1,
      },
      cell: ({ row, table }) => {
        return <DirsRemoveButton {...row.original} table={table} />;
      },
    },
  ]);

  const handleRowSelectionChagne = (v: RowSelection) => {
    setRowSelection(v);
    setSettings((old) => {
      return {
        ...old,
        includedDirectoriesReferenced: getRowSelectionKeys(v),
      };
    });
  };

  return (
    <div className="w-1/2 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-center">{t('includeDirectories')}</h3>
        <DirsActions
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChagne}
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
        onRowSelectionChange={handleRowSelectionChagne}
      />
    </div>
  );
}

function ExcludedDirsTable() {
  const t = useT();
  const settings = useAtomValue(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(excludedDirsRowSelectionAtom);
  const data: TableData[] = useMemo(() => {
    return settings.excludedDirectories.map((path) => {
      return {
        path,
        field: 'excludedDirectories',
      };
    });
  }, [settings]);

  const columns = createColumns<TableData>([
    {
      accessorKey: 'path',
      header: t('path'),
      meta: {
        span: 10,
      },
    },
    {
      id: 'actions',
      meta: {
        span: 1,
      },
      cell: ({ row, table }) => {
        return <DirsRemoveButton {...row.original} table={table} />;
      },
    },
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-center">{t('excludeDirectories')}</h3>
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
      />
    </div>
  );
}

function DirsRemoveButton(props: PropsWithTable<TableData>) {
  const { path, field, table } = props;
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

function DirsActions(props: PropsWithRowSelection<Pick<TableData, 'field'>>) {
  const t = useT();
  const { field, rowSelection, onRowSelectionChange } = props;
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
    <ScrollArea className="flex-1 rounded-md border text-card-foreground px-2 py-1 dark:bg-gray-900">
      <div className="whitespace-break-spaces">{logs}</div>
    </ScrollArea>
  );
}
