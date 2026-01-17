import type { ColumnDef, Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import { currentToolAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  currentFilterAtom,
  currentRowSelectionAtom,
  currentSortingAtom,
  tableDataWithSortingAndFilterAtom,
} from '~/atom/table';
import { createColumns, DataTable, PathCell } from '~/components/data-table';
import { Tools } from '~/consts';
import type {
  BadFileEntry,
  BrokenEntry,
  DuplicateEntry,
  FileEntry,
  FolderEntry,
  ImagesEntry,
  MusicEntry,
  SymlinksFileEntry,
  TemporaryFileEntry,
  ToolsValues,
  VideosEntry,
} from '~/types';
import { ImagePreview } from './image-preview';

// button width + padding(16px)
const columnMinSizeMap = {
  size: 100,
  fileName: 135,
  path: 102,
  modifiedDate: 163,
  folderName: 154,
  similarity: 133,
  dimensions: 149,
  title: 101,
  artist: 108,
  year: 101,
  bitrate: 116,
  length: 118,
  symlinkName: 164,
  symlinkPath: 157,
  destinationPath: 181,
  typeOfError: 158,
  currentExtension: 190,
  properExtension: 184,
} as const;

const columnsMap: Record<ToolsValues, ColumnDef<any>[]> = {
  [Tools.DuplicateFiles]: createColumns([
    {
      accessorKey: 'size',
      header: 'size',
      size: 110,
      minSize: columnMinSizeMap.size,
    },
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 180,
      minSize: columnMinSizeMap.fileName,
      cell: DuplicateImageFileNameCell,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 320,
      minSize: columnMinSizeMap.path,
      cell: PathCell,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.EmptyFolders]: createColumns<FolderEntry>([
    {
      accessorKey: 'folderName',
      header: 'folderName',
      size: 180,
      minSize: columnMinSizeMap.folderName,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 430,
      minSize: columnMinSizeMap.path,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.BigFiles]: createColumns<FileEntry>([
    {
      accessorKey: 'size',
      header: 'size',
      size: 110,
      minSize: columnMinSizeMap.size,
    },
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 180,
      minSize: columnMinSizeMap.fileName,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 320,
      minSize: columnMinSizeMap.path,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.EmptyFiles]: createColumns<FileEntry>([
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 180,
      minSize: columnMinSizeMap.fileName,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 430,
      minSize: columnMinSizeMap.path,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.TemporaryFiles]: createColumns<TemporaryFileEntry>([
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 180,
      minSize: columnMinSizeMap.fileName,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 430,
      minSize: columnMinSizeMap.path,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.SimilarImages]: createColumns<ImagesEntry>([
    {
      accessorKey: 'similarity',
      header: 'similarity',
      size: columnMinSizeMap.similarity,
      minSize: columnMinSizeMap.similarity,
    },
    {
      accessorKey: 'size',
      header: 'size',
      size: columnMinSizeMap.size,
      minSize: columnMinSizeMap.size,
    },
    {
      accessorKey: 'dimensions',
      header: 'dimensions',
      size: columnMinSizeMap.dimensions,
      minSize: columnMinSizeMap.dimensions,
    },
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 200,
      minSize: columnMinSizeMap.fileName,
      cell: SimilarImagesFileNameCell,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 300,
      minSize: columnMinSizeMap.path,
      cell: PathCell,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.SimilarVideos]: createColumns<VideosEntry>([
    {
      accessorKey: 'size',
      header: 'size',
      size: 110,
      minSize: columnMinSizeMap.size,
    },
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 180,
      minSize: columnMinSizeMap.fileName,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 320,
      minSize: columnMinSizeMap.path,
      cell: PathCell,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.MusicDuplicates]: createColumns<MusicEntry>([
    {
      accessorKey: 'size',
      header: 'size',
      size: columnMinSizeMap.size,
      minSize: columnMinSizeMap.size,
    },
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 200,
      minSize: columnMinSizeMap.fileName,
    },
    {
      accessorKey: 'trackTitle',
      header: 'title',
      size: columnMinSizeMap.title,
      minSize: columnMinSizeMap.title,
    },
    {
      accessorKey: 'trackArtist',
      header: 'artist',
      size: columnMinSizeMap.artist,
      minSize: columnMinSizeMap.artist,
    },
    {
      accessorKey: 'year',
      header: 'year',
      size: columnMinSizeMap.year,
      minSize: columnMinSizeMap.year,
    },
    {
      accessorKey: 'bitrate',
      header: 'bitrate',
      size: columnMinSizeMap.bitrate,
      minSize: columnMinSizeMap.bitrate,
    },
    {
      accessorKey: 'length',
      header: 'length',
      size: columnMinSizeMap.length,
      minSize: columnMinSizeMap.length,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 300,
      minSize: columnMinSizeMap.path,
      cell: PathCell,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.InvalidSymlinks]: createColumns<SymlinksFileEntry>(
    [
      {
        accessorKey: 'symlinkName',
        header: 'symlinkName',
        size: 180,
        minSize: columnMinSizeMap.symlinkName,
      },
      {
        accessorKey: 'path',
        header: 'symlinkPath',
        size: 220,
        minSize: columnMinSizeMap.symlinkPath,
      },
      {
        accessorKey: 'destinationPath',
        header: 'destinationPath',
        size: 220,
        minSize: columnMinSizeMap.destinationPath,
      },
      {
        accessorKey: 'typeOfError',
        header: 'typeOfError',
        size: columnMinSizeMap.typeOfError,
        minSize: columnMinSizeMap.typeOfError,
      },
      {
        accessorKey: 'modifiedDate',
        header: 'modifiedDate',
        size: columnMinSizeMap.modifiedDate,
        minSize: columnMinSizeMap.modifiedDate,
        id: 'modified_date',
      },
    ],
    { customActions: true },
  ),
  [Tools.BrokenFiles]: createColumns<BrokenEntry>([
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 180,
      minSize: columnMinSizeMap.fileName,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 190,
      minSize: columnMinSizeMap.path,
    },
    {
      accessorKey: 'errorString',
      header: 'typeOfError',
      size: columnMinSizeMap.typeOfError,
      minSize: columnMinSizeMap.typeOfError,
    },
    {
      accessorKey: 'size',
      header: 'size',
      size: columnMinSizeMap.size,
      minSize: columnMinSizeMap.size,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
  [Tools.BadExtensions]: createColumns<BadFileEntry>([
    {
      accessorKey: 'fileName',
      header: 'fileName',
      size: 180,
      minSize: columnMinSizeMap.fileName,
    },
    {
      accessorKey: 'path',
      header: 'path',
      size: 220,
      minSize: columnMinSizeMap.path,
    },
    {
      accessorKey: 'currentExtension',
      header: 'currentExtension',
      size: columnMinSizeMap.currentExtension,
      minSize: columnMinSizeMap.currentExtension,
    },
    {
      accessorKey: 'properExtensionsGroup',
      header: 'properExtension',
      size: columnMinSizeMap.properExtension,
      minSize: columnMinSizeMap.properExtension,
    },
    {
      accessorKey: 'modifiedDate',
      header: 'modifiedDate',
      size: columnMinSizeMap.modifiedDate,
      minSize: columnMinSizeMap.modifiedDate,
      id: 'modified_date',
    },
  ]),
};

export function Table({ className }: { className?: string }) {
  const data = useAtomValue(tableDataWithSortingAndFilterAtom);
  const [rowSelection, setRowSelection] = useAtom(currentRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentSortingAtom);
  const [filter, setFilter] = useAtom(currentFilterAtom);
  const currentTool = useAtomValue(currentToolAtom);

  const columns = columnsMap[currentTool];

  return (
    <DataTable
      className={className}
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      sorting={sorting}
      onSortingChange={setSorting}
      manualSorting
      globalFilter={filter}
      onGlobalFilterChange={setFilter}
      manualFiltering
    />
  );
}

function DuplicateImageFileNameCell({ row }: { row: Row<DuplicateEntry> }) {
  const { hidden, path, fileName, isImage } = row.original;

  const settings = useAtomValue(settingsAtom);

  if (hidden) {
    return null;
  }

  if (settings.duplicateImagePreview && isImage) {
    return (
      <ImagePreview path={path}>
        <div className="truncate">{fileName}</div>
      </ImagePreview>
    );
  }

  return fileName;
}

function SimilarImagesFileNameCell({ row }: { row: Row<ImagesEntry> }) {
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
