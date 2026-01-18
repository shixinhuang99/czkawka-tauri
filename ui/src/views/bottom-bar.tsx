import type { Row, Table } from '@tanstack/react-table';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  FolderIcon,
  ScrollTextIcon,
  Settings2Icon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import {
  excludedDirsRowSelectionAtom,
  excludedDirsRowSortingAtom,
  includedDirsRowSelectionAtom,
  includedDirsRowSortingAtom,
  logsAtom,
} from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { Button, ScrollArea } from '~/components';
import { TooltipContent } from '~/components/custom/tooltip';
import {
  createColumns,
  DataTable,
  type RowSelectionUpdater,
} from '~/components/data-table';
import { Tabs, TabsList, TabsTrigger } from '~/components/shadcn/tabs';
import { Tooltip, TooltipTrigger } from '~/components/shadcn/tooltip';
import { useT } from '~/hooks';
import type { DirsType } from '~/types';
import { getRowSelectionKeys } from '~/utils/table-helper';
import { DirsActions } from './dirs-actions';
import { Operations } from './operations';
import { ToolSettings } from './tool-settings';

const DisplayType = {
  Dirs: 'dirs',
  Logs: 'logs',
  ToolSettings: 'toolSettings',
} as const;

interface DirsData {
  path: string;
  field: DirsType;
  // useless just for type checking
  rawData: { path: string; [key: string]: any };
}

interface BottomBarProps {
  headerRef: React.RefObject<HTMLDivElement>;
}

export function BottomBar({ headerRef }: BottomBarProps) {
  const t = useT();
  const [displayType, setDisplayType] = useState<string>(DisplayType.Dirs);

  return (
    <div className="flex flex-col h-full px-2 py-1 gap-1">
      <div ref={headerRef} className="flex justify-between items-center">
        <Operations />
        <div className="flex items-center gap-1">
          <Tabs value={displayType} onValueChange={setDisplayType}>
            <TabsList>
              <TabsTrigger value={DisplayType.Dirs}>
                <FolderIcon />
                <span className="ml-2 select-none">{t('directories')}</span>
              </TabsTrigger>
              <TabsTrigger value={DisplayType.ToolSettings}>
                <Settings2Icon />
                <span className="ml-2 select-none">{t('toolSettings')}</span>
              </TabsTrigger>
              <TabsTrigger value={DisplayType.Logs}>
                <ScrollTextIcon />
                <span className="ml-2 select-none">{t('logs')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {displayType === DisplayType.Dirs && (
        <div className="flex gap-1 flex-1 min-h-0">
          <IncludedDirsTable />
          <ExcludedDirsTable />
        </div>
      )}
      {displayType === DisplayType.Logs && <Logs />}
      {displayType === DisplayType.ToolSettings && <ToolSettings />}
    </div>
  );
}

const includedDirsTableColumns = createColumns<DirsData>(
  [
    {
      accessorKey: 'path',
      header: 'path',
      meta: {
        span: 10,
      },
      cell: IncludeDirsPathCell,
    },
    {
      id: 'actions',
      meta: {
        span: 1,
      },
      cell: DirsRemoveButton,
    },
  ],
  { customActions: true, headerClassName: '-ml-4' },
);

function IncludedDirsTable() {
  const t = useT();
  const [settings, setSettings] = useAtom(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(includedDirsRowSelectionAtom);
  const [sorting, setSorting] = useAtom(includedDirsRowSortingAtom);
  const data: DirsData[] = settings.includedDirectories.map((path) => {
    return {
      path,
      field: 'includedDirectories',
      rawData: {
        path,
      },
    };
  });

  const handleRowSelectionChange = (updater: RowSelectionUpdater) => {
    setRowSelection(updater);
    const selectedKeys =
      typeof updater === 'function' ? updater(rowSelection) : updater;
    setSettings((old) => {
      return {
        ...old,
        includedDirectoriesReferenced: getRowSelectionKeys(selectedKeys),
      };
    });
  };

  return (
    <div className="w-1/2 flex flex-col">
      <div className="flex justify-between items-center">
        <SectionHeader>{t('includeDirectories')}</SectionHeader>
        <DirsActions
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          field="includedDirectories"
        />
      </div>
      <DataTable
        className="flex-1"
        data={data}
        columns={includedDirsTableColumns}
        emptyTip={t('pleaseAddPath')}
        layout="grid"
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}

function findExcludedParentPath(
  path: string,
  excludedDirectories: string[],
): string | null {
  for (const excludedPath of excludedDirectories) {
    const separator = excludedPath.includes('\\') ? '\\' : '/';
    const normalizedExcludedPath = excludedPath.endsWith(separator)
      ? excludedPath
      : excludedPath + separator;

    if (path.startsWith(normalizedExcludedPath) || path === excludedPath) {
      return excludedPath;
    }
  }
  return null;
}

function IncludeDirsPathCell({ row }: { row: Row<DirsData> }) {
  const { path } = row.original;

  const settings = useAtomValue(settingsAtom);

  const excludedParentPath = findExcludedParentPath(
    path,
    settings.excludedDirectories,
  );

  if (excludedParentPath) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-muted-foreground cursor-help line-through">
            {path}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <Trans
            i18nKey="pathInvalid"
            values={{ excludedPath: `"${excludedParentPath}"` }}
          >
            This path is invalid because it is included in the excluded path
            <span className="text-primary" />
          </Trans>
        </TooltipContent>
      </Tooltip>
    );
  }

  return path;
}

const excludedDirsTableColumns = createColumns<DirsData>(
  [
    {
      accessorKey: 'path',
      header: 'path',
      meta: {
        span: 10,
      },
    },
    {
      id: 'actions',
      meta: {
        span: 1,
      },
      cell: DirsRemoveButton,
    },
  ],
  { customActions: true, headerClassName: '-ml-4' },
);

function ExcludedDirsTable() {
  const t = useT();
  const settings = useAtomValue(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(excludedDirsRowSelectionAtom);
  const [sorting, setSorting] = useAtom(excludedDirsRowSortingAtom);
  const data: DirsData[] = settings.excludedDirectories.map((path) => {
    return {
      path,
      field: 'excludedDirectories',
      rawData: {
        path,
      },
    };
  });

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <SectionHeader>{t('excludeDirectories')}</SectionHeader>
        <DirsActions
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          field="excludedDirectories"
        />
      </div>
      <DataTable
        className="flex-1"
        data={data}
        columns={excludedDirsTableColumns}
        emptyTip={t('pleaseAddPath')}
        layout="grid"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}

function DirsRemoveButton({
  row,
  table,
}: {
  row: Row<DirsData>;
  table: Table<DirsData>;
}) {
  const { path, field } = row.original;
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

function Logs() {
  const logs = useAtomValue(logsAtom);

  return (
    <ScrollArea className="flex-1 rounded-md border text-card-foreground px-2 py-1">
      <div className="whitespace-break-spaces">{logs}</div>
    </ScrollArea>
  );
}

function SectionHeader({ children }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground tracking-wider">
      {children}
    </h3>
  );
}
