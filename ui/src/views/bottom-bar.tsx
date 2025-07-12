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
  Star,
  Settings2,
  FolderMinus,
  SquareMousePointer,
  Sliders,
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
import { useBoolean, useT } from '~/hooks';
import type { DirsType } from '~/types';
import { cn } from '~/utils/cn';
import { getRowSelectionKeys, splitStr } from '~/utils/common';
import { Operations } from './operations';
import { ToolSettings } from './tool-settings';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '~/components/shadcn/resizable';
import { RowSelectionMenu } from './row-selection-menu';
import { currentToolAtom } from '~/atom/primitive';

const DisplayType = {
  Dirs: 'dirs',
  Logs: 'logs',
} as const;

interface TableData {
  path: string;
  field: DirsType;
  isReference?: boolean;
}

type PropsWithTable<T> = T & {
  table: Table<TableData>;
};

type PropsWithRowSelection<T> = T & {
  rowSelection: RowSelection;
  onRowSelectionChange: (v: RowSelection) => void;
};

export function BottomBar() {
  const [displayType, setDisplayType] = useState<string>(DisplayType.Dirs);
  const minimizeBottomBar = useBoolean();
  const t = useT();
  const excludedDirsDialogOpen = useBoolean();
  const [settings, setSettings] = useAtom(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(excludedDirsRowSelectionAtom);
  
  return (
    <div className="flex flex-col px-2 py-1 gap-1 border-t">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Operations />
          <RowSelectionMenu disabled={false} />
        </div>
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
          <Dialog open={excludedDirsDialogOpen.value} onOpenChange={excludedDirsDialogOpen.set}>
            <DialogTrigger asChild>
              <TooltipButton tooltip={t('Exclude Directories')} variant="outline">
                <FolderMinus />
              </TooltipButton>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{t('Exclude Directories')}</DialogTitle>
                <DialogDescription>
                  {t('Manage directories to exclude from scanning')}
                </DialogDescription>
              </DialogHeader>
              <div className="h-[400px]">
                <ExcludedDirsTable />
              </div>
            </DialogContent>
          </Dialog>
          <TooltipButton
            tooltip={minimizeBottomBar.value ? t('Expand') : t('Collapse')}
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
      {!minimizeBottomBar.value && (
        <ResizablePanelGroup
          direction="vertical"
          className="min-h-[200px]"
        >
          <ResizablePanel defaultSize={100} minSize={20}>
            {displayType === DisplayType.Dirs ? (
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25} minSize={15}>
                  <ToolControlsPanel />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={15}>
                  <ToolAlgorithmPanel />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={20}>
                  <IncludedDirsTable />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <Logs />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}

function ToolControlsPanel() {
  const t = useT();
  
  return (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      <div className="bg-muted/30 p-2 border-b">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <Sliders className="h-4 w-4" />
          <span>{t('Tool controls')}</span>
        </h3>
      </div>
      <div className="flex-1 overflow-auto p-2 hide-scrollbar">
        <ToolSettings inPanel={true} showControls={true} showAlgorithms={false} />
      </div>
    </div>
  );
}

function ToolAlgorithmPanel() {
  const t = useT();
  
  return (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      <div className="bg-muted/30 p-2 border-b">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <Settings2 className="h-4 w-4" />
          <span>{t('Algorithm settings')}</span>
        </h3>
      </div>
      <div className="flex-1 overflow-auto p-2 hide-scrollbar">
        <ToolSettings inPanel={true} showControls={false} showAlgorithms={true} />
      </div>
    </div>
  );
}

function IncludedDirsTable() {
  const t = useT();
  const [settings, setSettings] = useAtom(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(includedDirsRowSelectionAtom);
  const data: TableData[] = useMemo(() => {
    return settings.includedDirectories.map((path) => {
      return {
        path,
        field: 'includedDirectories',
        isReference: settings.includedDirectoriesReferenced.includes(path),
      };
    });
  }, [settings]);

  const columns = createColumns<TableData>([
    {
      accessorKey: 'path',
      header: t('Path'),
      meta: {
        span: 9,
      },
    },
    {
      id: 'reference',
      header: () => (
        <div className="flex justify-center">
          <span className="text-xs text-muted-foreground font-normal">
            {t('Reference')}
          </span>
        </div>
      ),
      meta: {
        span: 1,
      },
      cell: ({ row }) => {
        const isReference = row.original.isReference;
        return (
          <div className="flex justify-center">
            <Button
              variant={isReference ? "default" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => handleReferenceToggle(row.original.path)}
              title={t('Use as reference')}
            >
              <Star className={cn("h-4 w-4", isReference ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
            </Button>
          </div>
        );
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

  const handleReferenceToggle = (path: string) => {
    setSettings((old) => {
      const isCurrentlyReference = old.includedDirectoriesReferenced.includes(path);
      const newReferences = isCurrentlyReference
        ? old.includedDirectoriesReferenced.filter((p) => p !== path)
        : [...old.includedDirectoriesReferenced, path];
      
      return {
        ...old,
        includedDirectoriesReferenced: newReferences,
      };
    });
  };

  return (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      <div className="flex justify-between items-center bg-muted/30 p-2 border-b">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <Folder className="h-4 w-4" />
          <span>{t('Include Directories')}</span>
        </h3>
        <DirsActions
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          field="includedDirectories"
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {settings.includedDirectoriesReferenced.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 border-b">
            {/* <div className="font-medium">{t('Reference Directories')}:</div> */}
            {/* <div>{t('Reference directories hint')}</div> */}
          </div>
        )}
        <DataTable
          className="flex-1"
          data={data}
          columns={columns}
          emptyTip={t('Please add path')}
          layout="grid"
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
    </div>
  );
}

function ExcludedDirsTable() {
  const t = useT();
  const [settings, setSettings] = useAtom(settingsAtom);
  const [rowSelection, setRowSelection] = useAtom(excludedDirsRowSelectionAtom);
  const data: TableData[] = useMemo(() => {
    return settings.excludedDirectories.map((path) => {
      return {
        path,
        field: 'excludedDirectories',
      };
    });
  }, [settings]);

  const columns = createColumns<TableData>([
    {
      accessorKey: 'path',
      header: t('Path'),
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

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-center">{t('Exclude Directories')}</h3>
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
        emptyTip={t('Please add path')}
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
  const t = useT();
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

  const checkPathForReferenceKeywords = (path: string, keywords: string): boolean => {
    if (field !== 'includedDirectories') return false;
    
    const keywordList = splitStr(keywords);
    return keywordList.some(keyword => keyword && path.includes(keyword));
  };

  const handleAddPath = async () => {
    openFileDialogLoading.on();
    const dirs = await openFileDialog({ multiple: true, directory: true });
    openFileDialogLoading.off();
    if (!dirs || dirs.length === 0) {
      return;
    }
    
    setSettings((settings) => {
      const currentDirs = settings[field];
      const newDirs = Array.isArray(dirs) ? dirs : [dirs];
      const uniqueDirs = newDirs.filter(dir => !currentDirs.includes(dir));
      
      if (uniqueDirs.length === 0) {
        return settings;
      }
      
      // Check for reference keywords if this is for includedDirectories
      if (field === 'includedDirectories') {
        const newReferenceDirs = [...settings.includedDirectoriesReferenced];
        
        for (const dir of uniqueDirs) {
          if (checkPathForReferenceKeywords(dir, settings.referencePathKeywords)) {
            if (!newReferenceDirs.includes(dir)) {
              newReferenceDirs.push(dir);
            }
          }
        }
        
        return {
          ...settings,
          [field]: [...uniqueDirs, ...currentDirs],
          includedDirectoriesReferenced: newReferenceDirs,
        };
      }
      
      return {
        ...settings,
        [field]: [...uniqueDirs, ...currentDirs],
      };
    });
  };

  const handleManualAddOk = () => {
    const paths = splitStr(manualAddPaths);
    setSettings((settings) => {
      // Check for reference keywords if this is for includedDirectories
      if (field === 'includedDirectories') {
        const newReferenceDirs = [...settings.includedDirectoriesReferenced];
        
        for (const path of paths) {
          if (checkPathForReferenceKeywords(path, settings.referencePathKeywords)) {
            if (!newReferenceDirs.includes(path)) {
              newReferenceDirs.push(path);
            }
          }
        }
        
        return {
          ...settings,
          [field]: Array.from(new Set([...paths, ...settings[field]])),
          includedDirectoriesReferenced: newReferenceDirs,
        };
      }
      
      return {
        ...settings,
        [field]: Array.from(new Set([...paths, ...settings[field]])),
      };
    });
    manualAddDialogOpen.off();
  };

  return (
    <div className="flex gap-1">
      <TooltipButton tooltip={t('Add')} onClick={handleAddPath} size="sm">
        {openFileDialogLoading.value ? (
          <LoaderCircle className="animate-spin h-4 w-4" />
        ) : (
          <FolderPlus className="h-4 w-4" />
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
          <TooltipButton tooltip={t('Manual add')} size="sm">
            <FolderPen className="h-4 w-4" />
          </TooltipButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Manual add')}</DialogTitle>
            <DialogDescription>
              {t('Manually add paths desc')}
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
              {t('Cancel')}
            </Button>
            <Button onClick={handleManualAddOk}>{t('Ok')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TooltipButton tooltip={t('Remove selected')} onClick={handleRemovePaths} size="sm">
        <Trash2 className="h-4 w-4" />
      </TooltipButton>
    </div>
  );
}

function Logs() {
  const logs = useAtomValue(logsAtom);

  return (
    <ScrollArea className="h-full rounded-md border text-card-foreground px-2 py-1 dark:bg-gray-900 hide-scrollbar">
      <div className="whitespace-break-spaces">{logs}</div>
    </ScrollArea>
  );
}
