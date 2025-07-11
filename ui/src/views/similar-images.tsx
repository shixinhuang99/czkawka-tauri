import type { ColumnDef, Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import {
  similarImagesAtom,
  similarImagesRowSelectionAtom,
} from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  DataTable,
  TableActions,
  TableRowSelectionCell,
  TableRowSelectionHeader,
} from '~/components/data-table';
import { useT } from '~/hooks';
import type { ImagesEntry } from '~/types';
import { ClickableImagePreview } from './clickable-image-preview';

export function SimilarImages() {
  const data = useAtomValue(similarImagesAtom);
  const [rowSelection, setRowSelection] = useAtom(
    similarImagesRowSelectionAtom,
  );
  const t = useT();

  const columns: ColumnDef<ImagesEntry>[] = [
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
      accessorKey: 'similarity',
      header: t('Similarity'),
      size: 100,
      minSize: 80,
    },
    {
      accessorKey: 'size',
      header: t('Size'),
      size: 100,
      minSize: 50,
    },
    {
      accessorKey: 'dimensions',
      header: t('Dimensions'),
      size: 100,
      minSize: 100,
    },
    {
      accessorKey: 'fileName',
      header: t('File name'),
      size: 150,
      minSize: 100,
      cell: ({ row }) => {
        return <FileName row={row} />;
      },
    },
    {
      accessorKey: 'path',
      header: t('Path'),
      size: 160,
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
      header: t('Modified date'),
      size: 160,
      minSize: 120,
    },
    {
      id: 'actions',
      size: 55,
      minSize: 55,
      cell: ({ cell }) => {
        if (cell.row.original.isRef) {
          return null;
        }
        return <TableActions path={cell.row.original.path} />;
      },
    },
  ];

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}

function FileName(props: { row: Row<ImagesEntry> }) {
  const { row } = props;
  const { hidden, path, fileName } = row.original;

  const settings = useAtomValue(settingsAtom);

  if (hidden) {
    return null;
  }

  if (settings.similarImagesShowImagePreview) {
    return (
      <ClickableImagePreview path={path}>
        <div className="truncate">{fileName}</div>
      </ClickableImagePreview>
    );
  }

  return fileName;
}
