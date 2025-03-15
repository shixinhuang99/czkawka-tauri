import type { ColumnDef } from '@tanstack/react-table';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { useAtom, useAtomValue } from 'jotai';
import { FolderOpen } from 'lucide-react';
import {
  duplicateFilesAtom,
  duplicateFilesRowSelectionAtom,
} from '~/atom/primitive';
import { Checkbox, TooltipButton } from '~/components';
import { DataTable } from '~/components/data-table';
import type { DuplicateEntry } from '~/types';

const columns: ColumnDef<DuplicateEntry>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {
      if (row.original.isRef) {
        return null;
      }
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      );
    },
    meta: {
      span: 1,
    },
    size: 40,
    minSize: 40,
  },
  {
    accessorKey: 'size',
    header: 'Size',
    size: 110,
    minSize: 50,
  },
  {
    accessorKey: 'fileName',
    header: 'File name',
    size: 180,
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Path',
    cell: ({ row }) => {
      if (row.original.hidden) {
        return null;
      }
      return row.original.path;
    },
    size: 320,
    minSize: 100,
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    size: 160,
    minSize: 120,
  },
  {
    id: 'actions',
    cell: ({ cell }) => {
      if (cell.row.original.isRef) {
        return null;
      }
      return (
        <TooltipButton
          tooltip={`Reveal in ${PLATFORM === 'darwin' ? 'Finder' : 'File Explorer'}`}
          onClick={() => revealItemInDir(cell.row.original.path)}
        >
          <FolderOpen />
        </TooltipButton>
      );
    },
    size: 50,
    minSize: 50,
  },
];

export function DuplicateFiles() {
  const [rowSelection, setRowSelection] = useAtom(
    duplicateFilesRowSelectionAtom,
  );
  const duplicateFiles = useAtomValue(duplicateFilesAtom);

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={duplicateFiles}
      columns={columns}
      rowIdField="path"
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}
