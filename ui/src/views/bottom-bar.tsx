import type { Table } from '@tanstack/react-table';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ArrowDownFromLine,
  Folder,
  FolderPen,
  FolderPlus,
  LoaderCircle,
  ScrollText,
  Trash2,
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
  DataTable,
  type RowSelection,
  createColumns,
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
import { useBoolean } from '~/hooks/use-boolean';
import type { DirsType } from '~/types';
import { cn } from '~/utils/cn';
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

const columns = createColumns<TableData>([
  {
    accessorKey: 'path',
    header: 'Path',
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

export function BottomBar() {
  const [displayType, setDisplayType] = useState<string>(DisplayType.Dirs);
  const minimizeBottomBar = useBoolean();

  return (
    <div className="flex flex-col px-2 py-1 gap-1 border-t">
      <div className="flex justify-between items-center">
        <Operations />
        <div className="flex items-center gap-1">
          <Tabs value={displayType} onValueChange={setDisplayType}>
            <TabsList>
              <TabsTrigger value={DisplayType.Dirs}>
                <Folder />
              </TabsTrigger>
              <TabsTrigger value={DisplayType.Logs}>
                <ScrollText />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <TooltipButton
            tooltip={minimizeBottomBar.value ? 'Expand' : 'Collapse'}
            onClick={minimizeBottomBar.toggle}
            variant="outline"
          >
            <ArrowDownFromLine
              className={cn(
                'transition-transform duration-300',
                minimizeBottomBar.value && 'rotate-180',
              )}
            />
          </TooltipButton>
        </div>
      </div>
      {displayType === DisplayType.Dirs && !minimizeBottomBar.value && (
        <div className="flex gap-1 h-[200px]">
          <IncludedDirsTable />
          <ExcludedDirsTable />
        </div>
      )}
      {displayType === DisplayType.Logs && !minimizeBottomBar.value && <Logs />}
    </div>
  );
}

function IncludedDirsTable() {
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
        <h3 className="text-center">Include Directories</h3>
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
        emptyTip="Please add path"
        layout="grid"
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChagne}
      />
    </div>
  );
}

function ExcludedDirsTable() {
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

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-center">Exclude Directories</h3>
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
        emptyTip="Please add path"
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
      <Trash2 />
    </Button>
  );
}

function DirsActions(props: PropsWithRowSelection<Pick<TableData, 'field'>>) {
  const { field, rowSelection, onRowSelectionChange } = props;
  const setSettings = useSetAtom(settingsAtom);
  const manualAddDialogOpen = useBoolean();
  const [manualAddPaths, setManualAddPaths] = useState('');
  const openFileDialogLoading = useBoolean();

  const handleRemovePaths = () => {
    const selected = new Set(getRowSelectionKeys(rowSelection));
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
    openFileDialogLoading.on();
    const dir = await openFileDialog({ multiple: false, directory: true });
    openFileDialogLoading.off();
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
    manualAddDialogOpen.off();
  };

  return (
    <div>
      <TooltipButton tooltip="Add" onClick={handleAddPath}>
        {openFileDialogLoading.value ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <FolderPlus />
        )}
      </TooltipButton>
      <Dialog
        open={manualAddDialogOpen.value}
        onOpenChange={(v) => {
          setManualAddPaths('');
          manualAddDialogOpen.set(v);
        }}
      >
        <DialogTrigger asChild>
          <TooltipButton tooltip="Manual add">
            <FolderPen />
          </TooltipButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual add</DialogTitle>
            <DialogDescription>
              Manually add paths(one per line)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={10}
            value={manualAddPaths}
            onChange={(e) => setManualAddPaths(e.target.value)}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={manualAddDialogOpen.off}>
              Cancel
            </Button>
            <Button onClick={handleManualAddOk}>Ok</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TooltipButton tooltip="Remove selected" onClick={handleRemovePaths}>
        <Trash2 />
      </TooltipButton>
    </div>
  );
}

function Logs() {
  const logs = useAtomValue(logsAtom);

  return (
    <ScrollArea className="h-[200px] rounded-md border bg-card text-card-foreground px-2 py-1">
      <div className="whitespace-break-spaces">{logs}</div>
    </ScrollArea>
  );
}
