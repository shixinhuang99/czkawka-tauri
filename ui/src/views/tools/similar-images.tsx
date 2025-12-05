import type { Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import { settingsAtom } from '~/atom/settings';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { ImagesEntry } from '~/types';
import { ImagePreview } from '../image-preview';

export function SimilarImages() {
  const data = useAtomValue(currentToolDataAtom) as ImagesEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<ImagesEntry>([
    {
      accessorKey: 'similarity',
      header: t('similarity'),
      size: COLUMN_MIN_SIZES.similarity,
      minSize: COLUMN_MIN_SIZES.similarity,
    },
    {
      accessorKey: 'size',
      header: t('size'),
      size: COLUMN_MIN_SIZES.size,
      minSize: COLUMN_MIN_SIZES.size,
    },
    {
      accessorKey: 'dimensions',
      header: t('dimensions'),
      size: COLUMN_MIN_SIZES.dimensions,
      minSize: COLUMN_MIN_SIZES.dimensions,
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 200,
      minSize: COLUMN_MIN_SIZES.fileName,
      cell: ({ row }) => {
        return <FileName row={row} />;
      },
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 300,
      minSize: COLUMN_MIN_SIZES.path,
      cell: ({ row }) => {
        if (row.original.hidden) {
          return null;
        }
        return row.original.path;
      },
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
      size: COLUMN_MIN_SIZES.modifiedDate,
      minSize: COLUMN_MIN_SIZES.modifiedDate,
    },
  ]);

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      sorting={sorting}
      onSortingChange={setSorting}
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
      <ImagePreview path={path}>
        <div className="truncate">{fileName}</div>
      </ImagePreview>
    );
  }

  return fileName;
}
