import type { ColumnDef, Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import {
  duplicateFilesAtom,
  duplicateFilesRowSelectionAtom,
} from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  DataTable,
  TableActions,
  TableRowSelectionCell,
  TableRowSelectionHeader,
} from '~/components/data-table';
import type { DuplicateEntry } from '~/types';
import { isImage } from '~/utils/common';
import { ImagePreview } from './image-preview';

const columns: ColumnDef<DuplicateEntry>[] = [
  {
    id: 'select',
    meta: {
      span: 1,
    },
    size: 40,
    minSize: 40,
    header: ({ table }) => {
      return <TableRowSelectionHeader table={table} />;
    },
    cell: ({ row }) => {
      if (row.original.isRef) {
        return null;
      }
      return <TableRowSelectionCell row={row} />;
    },
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
    cell: ({ row }) => {
      return <FileName row={row} />;
    },
  },
  {
    accessorKey: 'path',
    header: 'Path',
    size: 320,
    minSize: 100,
    cell: ({ row }) => {
      if (row.original.hidden) {
        return null;
      }
      return row.original.path;
    },
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    size: 160,
    minSize: 120,
  },
  {
    id: 'actions',
    size: 50,
    minSize: 50,
    cell: ({ cell }) => {
      if (cell.row.original.isRef) {
        return null;
      }
      return <TableActions path={cell.row.original.path} />;
    },
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

function FileName(props: { row: Row<DuplicateEntry> }) {
  const { row } = props;
  const { hidden, path, fileName } = row.original;

  const settings = useAtomValue(settingsAtom);

  if (hidden) {
    return null;
  }

  if (settings.duplicateImagePreview && isImage(fileName)) {
    return (
      <ImagePreview path={path}>
        <div className="truncate">{fileName}</div>
      </ImagePreview>
    );
  }

  return fileName;
}
