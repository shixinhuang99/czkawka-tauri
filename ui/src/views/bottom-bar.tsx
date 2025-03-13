import type { Table } from '@tanstack/react-table';
import { isTauri } from '@tauri-apps/api/core';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Folder,
  FolderPen,
  FolderPlus,
  ScrollText,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { logsAtom } from '~/atom/primitive';
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
import { getRowSelectionKeys, splitStr } from '~/utils/common';
import { emitter } from '~/utils/event';
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
    cell: ({ row, table }) => {
      return <DirsRemoveButton {...row.original} table={table} />;
    },
    meta: {
      span: 1,
    },
  },
]);

export function BottomBar() {
  const [displayType, setDisplayType] = useState<string>(DisplayType.Dirs);

  return (
    <div className="h-[250px] flex flex-col px-2 py-1 gap-1 border-t">
      <div className="flex justify-between items-center">
        <Operations />
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
      {displayType === DisplayType.Logs && <Logs />}
    </div>
  );
}

function IncludedDirsTable() {
  const settings = useAtomValue(settingsAtom);
  const [rowSelection, setRowSelection] = useState<RowSelection>({});
  const data: TableData[] = useMemo(() => {
    return settings.includedDirectories.map((path) => {
      return {
        path,
        field: 'includedDirectories',
      };
    });
  }, [settings]);

  return (
    <div className="w-1/2 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-center">Include Directories</h3>
        <DirsActions
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          field="includedDirectories"
        />
      </div>
      <DataTable
        className="flex-1"
        data={data}
        columns={columns}
        emptyTip="Please add path"
        layout="grid"
        rowIdField="path"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  );
}

function ExcludedDirsTable() {
  const settings = useAtomValue(settingsAtom);
  const [rowSelection, setRowSelection] = useState<RowSelection>({});
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
        rowIdField="path"
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const listener = () => {
      onRowSelectionChange({});
    };
    emitter.on('reset-settings', listener);
    return () => emitter.off('reset-settings', listener);
  }, []);

  const handleRemovePaths = () => {
    const selectedPaths = getRowSelectionKeys(rowSelection);
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
    onRowSelectionChange({});
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
    const paths = splitStr(manualAddPaths);
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

function Logs() {
  const logs = useAtomValue(logsAtom);

  return (
    <ScrollArea className="flex-1 rounded-md border bg-card text-card-foreground px-2 py-1">
      <div className="whitespace-break-spaces">{logs}</div>
    </ScrollArea>
  );
}
