import { useState } from 'react';
import { useAtom } from 'jotai';
import {
  Folder,
  ScrollText,
  Search,
  FolderSymlink,
  Trash2,
  FolderLock,
  SquareMousePointer,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button, ScrollArea, Checkbox } from '~/components';
import { Tabs, TabsList, TabsTrigger } from '~/components/shadcn/tabs';
import { DataTable } from '~/components/shadcn/data-table';
import { currentPresetAtom } from '~/atom/preset';

const ContentKind = {
  Dirs: 'dirs',
  Logs: 'logs',
} as const;

const directoriesColumns: ColumnDef<{ path: string }>[] = [
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
    enableSorting: false,
    enableHiding: false,
    meta: {
      span: 1,
    },
  },
  {
    accessorKey: 'path',
    header: 'Path',
    cell: ({ row }) => {
      return <div className="break-all">{row.original.path}</div>;
    },
    meta: {
      span: 10,
    },
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <Button variant="ghost" size="icon">
          <Trash2 />
        </Button>
      );
    },
    meta: {
      span: 1,
    },
  },
];

export function BottomBar() {
  const [contentKind, setContentKind] = useState<string>(ContentKind.Dirs);
  const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom);

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
        <Tabs value={contentKind} onValueChange={setContentKind}>
          <TabsList>
            <TabsTrigger value={ContentKind.Dirs}>
              <Folder />
            </TabsTrigger>
            <TabsTrigger value={ContentKind.Logs}>
              <ScrollText />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {contentKind === ContentKind.Dirs && (
        <div className="flex gap-1 flex-1 h-px">
          <div className="w-1/2 flex flex-col">
            <h3 className="text-center">Include Directories</h3>
            <DataTable
              className="flex-1"
              columns={directoriesColumns}
              data={currentPreset.settings.includedDirectories.map((path) => {
                return {
                  path,
                };
              })}
              eleWhenNoData="Please add path"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <h3 className="text-center">Exclude Directories</h3>
            <DataTable
              className="flex-1"
              columns={directoriesColumns}
              data={currentPreset.settings.excludedDirectories.map((path) => {
                return {
                  path,
                };
              })}
              eleWhenNoData="Please add path"
            />
          </div>
        </div>
      )}
      {contentKind === ContentKind.Logs && (
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
