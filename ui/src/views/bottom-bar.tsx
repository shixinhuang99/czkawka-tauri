import {
  type ColumnDef,
  type Table,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isTauri } from '@tauri-apps/api/core';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Folder,
  FolderLock,
  FolderPen,
  FolderPlus,
  FolderSymlink,
  ScrollText,
  Search,
  SquareMousePointer,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { settingsAtom } from '~/atom/settings';
import {
  Button,
  Checkbox,
  ScrollArea,
  Textarea,
  TooltipButton,
} from '~/components';
import { DataTable } from '~/components/shadcn/data-table';
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
import { emitter } from '~/utils/event';

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

const tableColumns: ColumnDef<TableData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    meta: {
      span: 1,
    },
  },
  {
    accessorKey: 'path',
    header: 'Path',
    cell: ({ row }) => {
      return (
        <div className="truncate" title={row.original.path}>
          {row.original.path}
        </div>
      );
    },
    meta: {
      span: 10,
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      return <DirsRemoveButton {...row.original} table={table} />;
    },
    meta: {
      span: 1,
    },
  },
];

export function BottomBar() {
  const [displayType, setDisplayType] = useState<string>(DisplayType.Dirs);

  return (
    <div className="h-[300px] flex flex-col px-2 py-1 gap-1 border-t">
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          <Button variant="secondary" className="mr-2">
            <Search />
            Scan
          </Button>
          <Button variant="secondary">
            <SquareMousePointer />
            Select
          </Button>
          <Button variant="secondary">
            <FolderSymlink />
            Move
          </Button>
          <Button variant="secondary">
            <Trash2 />
            Delete
          </Button>
          <Button variant="secondary">
            <FolderLock />
            Save
          </Button>
        </div>
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
      </div>
      {displayType === DisplayType.Dirs && (
        <div className="flex gap-1 flex-1 h-px">
          <IncludedDirsTable />
          <ExcludedDirsTable />
        </div>
      )}
      {displayType === DisplayType.Logs && (
        <ScrollArea className="flex-1 rounded-md border bg-card text-card-foreground px-2 py-1">
          <div>2</div>
          <div>2</div>
          <div>2</div>
          <div>2</div>
          <div>2</div>
          <div>2</div>
          <div>2</div>
          <div>2</div>
          <div>2</div>
        </ScrollArea>
      )}
    </div>
  );
}

function IncludedDirsTable() {
  'use no memo';

  const settings = useAtomValue(settingsAtom);

  const data: TableData[] = useMemo(() => {
    return settings.includedDirectories.map((path) => {
      return {
        path,
        field: 'includedDirectories',
      };
    });
  }, [settings]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.path,
  });

  return (
    <div className="w-1/2 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-center">Include Directories</h3>
        <DirsActions table={table} field="includedDirectories" />
      </div>
      <DataTable
        className="flex-1"
        table={table}
        emptyTip="Please add path"
        columnsLen={tableColumns.length}
      />
    </div>
  );
}

function ExcludedDirsTable() {
  'use no memo';

  const settings = useAtomValue(settingsAtom);

  const data: TableData[] = useMemo(() => {
    return settings.excludedDirectories.map((path) => {
      return {
        path,
        field: 'excludedDirectories',
      };
    });
  }, [settings]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.path,
  });

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-center">Exclude Directories</h3>
        <DirsActions table={table} field="excludedDirectories" />
      </div>
      <DataTable
        className="flex-1"
        table={table}
        emptyTip="Please add path"
        columnsLen={tableColumns.length}
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
    <Button variant="ghost" size="icon" onClick={handleRemovePath}>
      <Trash2 />
    </Button>
  );
}

function DirsActions(props: PropsWithTable<Pick<TableData, 'field'>>) {
  const { table, field } = props;
  const setSettings = useSetAtom(settingsAtom);
  const manualAddDialogOpen = useBoolean();
  const [manualAddPaths, setManualAddPaths] = useState('');

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const listener = () => {
      table.resetRowSelection();
    };
    emitter.on('reset-settings', listener);
    return () => emitter.off('reset-settings', listener);
  }, []);

  const handleRemovePaths = () => {
    const selectedPaths = Object.entries(table.getState().rowSelection)
      .filter((obj) => obj[1])
      .map((obj) => obj[0]);
    if (!selectedPaths.length) {
      return;
    }
    setSettings((settings) => {
      return {
        ...settings,
        [field]: settings[field].filter(
          (path) => !selectedPaths.includes(path),
        ),
      };
    });
    table.resetRowSelection();
  };

  const handleAddPath = async () => {
    if (!isTauri()) {
      return;
    }
    const dir = await openFileDialog({ multiple: false, directory: true });
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
        [field]: dirs.concat(dir),
      };
    });
  };

  const handleManualAddOk = () => {
    const paths = manualAddPaths
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setSettings((settings) => {
      return {
        ...settings,
        [field]: Array.from(new Set(settings[field].concat(...paths))),
      };
    });
    manualAddDialogOpen.off();
  };

  return (
    <div>
      <TooltipButton tooltip="Add" onClick={handleAddPath}>
        <FolderPlus />
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
            <Button onClick={handleManualAddOk}>Ok</Button>
            <Button variant="secondary" onClick={manualAddDialogOpen.off}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TooltipButton tooltip="Remove selected" onClick={handleRemovePaths}>
        <Trash2 />
      </TooltipButton>
    </div>
  );
}
