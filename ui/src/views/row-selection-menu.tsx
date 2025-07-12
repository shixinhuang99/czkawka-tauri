import { useAtomValue, useSetAtom } from 'jotai';
import { SquareMousePointer } from 'lucide-react';
import { currentToolAtom } from '~/atom/primitive';
import { currentToolDataAtom, currentToolRowSelectionAtom } from '~/atom/tools';
import { Button, OperationButton, Textarea } from '~/components';
import type { RowSelection } from '~/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/shadcn/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/shadcn/dropdown-menu';
import { Tools } from '~/consts';
import { useBoolean, useT } from '~/hooks';
import type { BaseEntry, RefEntry } from '~/types';
import { getPathsFromEntries, getRowSelectionKeys } from '~/utils/common';
import { useState } from 'react';

const toolsWithSizeAndDateSelect = new Set<string>([
  Tools.DuplicateFiles,
  Tools.SimilarImages,
  Tools.SimilarVideos,
  Tools.MusicDuplicates,
]);

export function RowSelectionMenu(props: { disabled: boolean }) {
  const { disabled } = props;

  const currentTool = useAtomValue(currentToolAtom);
  const currentToolData = useAtomValue(currentToolDataAtom);
  const setCurrentToolRowSelection = useSetAtom(currentToolRowSelectionAtom);
  const t = useT();
  const customSelectDialogOpen = useBoolean();
  const customUnselectDialogOpen = useBoolean();
  const [customPattern, setCustomPattern] = useState('');
  const [isRegex, setIsRegex] = useState(false);

  const handleInvertSelection = () => {
    invertSelection(currentToolData, setCurrentToolRowSelection);
  };

  const handleSelectAll = () => {
    const paths = getPathsFromEntries(currentToolData);
    setCurrentToolRowSelection(pathsToRowSelection(paths));
  };

  const handleSelectXXX = (
    type: 'size' | 'date' | 'resolution',
    dir: 'asc' | 'desc',
    inverse: boolean = false
  ) => {
    if (!toolsWithSizeAndDateSelect.has(currentTool)) {
      return;
    }
    setCurrentToolRowSelection(selectItem(currentToolData, type, dir, inverse));
  };

  const handleCustomSelect = (unselect: boolean = false) => {
    if (!customPattern.trim()) return;
    
    try {
      const pattern = isRegex ? new RegExp(customPattern) : customPattern;
      const paths = getPathsFromEntries(currentToolData);
      
      const matchedPaths = paths.filter(path => {
        if (isRegex) {
          return (pattern as RegExp).test(path);
        } else {
          return path.includes(pattern as string);
        }
      });
      
      if (unselect) {
        setCurrentToolRowSelection(old => {
          const oldSelected = new Set(getRowSelectionKeys(old));
          const newSelected = [...oldSelected].filter(path => !matchedPaths.includes(path));
          return pathsToRowSelection(newSelected);
        });
      } else {
        setCurrentToolRowSelection(old => {
          const oldSelected = new Set(getRowSelectionKeys(old));
          const newSelected = Array.from(new Set([...oldSelected, ...matchedPaths]));
          return pathsToRowSelection(newSelected);
        });
      }
    } catch (e) {
      console.error("Invalid regex pattern:", e);
    }
    
    if (unselect) {
      customUnselectDialogOpen.off();
    } else {
      customSelectDialogOpen.off();
    }
    setCustomPattern('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <OperationButton disabled={disabled}>
            <SquareMousePointer />
            {t('Select')}
          </OperationButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top">
          <DropdownMenuItem onClick={handleSelectAll}>
            {t('Select all')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleInvertSelection}>
            {t('Invert selection')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => customSelectDialogOpen.on()}>
            {t('Select custom')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => customUnselectDialogOpen.on()}>
            {t('Unselect custom')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {currentTool === Tools.SimilarImages && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{t('Resolution based')}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => handleSelectXXX('resolution', 'asc')}
                >
                  {t('Select the highest resolution')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSelectXXX('resolution', 'desc')}
                >
                  {t('Select the lowest resolution')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleSelectXXX('resolution', 'asc', true)}
                >
                  {t('Select all except highest resolution')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSelectXXX('resolution', 'desc', true)}
                >
                  {t('Select all except lowest resolution')}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          
          {toolsWithSizeAndDateSelect.has(currentTool) && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t('Size based')}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleSelectXXX('size', 'asc')}>
                    {t('Select the biggest size')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSelectXXX('size', 'desc')}>
                    {t('Select the smallest size')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSelectXXX('size', 'asc', true)}>
                    {t('Select all except biggest')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSelectXXX('size', 'desc', true)}>
                    {t('Select all except smallest')}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t('Date based')}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleSelectXXX('date', 'asc')}>
                    {t('Select the newest')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSelectXXX('date', 'desc')}>
                    {t('Select the oldest')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSelectXXX('date', 'asc', true)}>
                    {t('Select all except newest')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSelectXXX('date', 'desc', true)}>
                    {t('Select all except oldest')}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={customSelectDialogOpen.value} onOpenChange={customSelectDialogOpen.set}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Select custom')}</DialogTitle>
            <DialogDescription>
              {t('Enter a pattern to select files by path')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">
              <input 
                type="checkbox" 
                checked={isRegex} 
                onChange={(e) => setIsRegex(e.target.checked)}
                className="mr-2"
              />
              {t('Use regex')}
            </label>
          </div>
          <Textarea
            value={customPattern}
            onChange={(e) => setCustomPattern(e.target.value)}
            placeholder={isRegex ? t('Regular expression pattern') : t('Text to match in path')}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={customSelectDialogOpen.off}>
              {t('Cancel')}
            </Button>
            <Button onClick={() => handleCustomSelect(false)}>
              {t('Select')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={customUnselectDialogOpen.value} onOpenChange={customUnselectDialogOpen.set}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Unselect custom')}</DialogTitle>
            <DialogDescription>
              {t('Enter a pattern to unselect files by path')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">
              <input 
                type="checkbox" 
                checked={isRegex} 
                onChange={(e) => setIsRegex(e.target.checked)}
                className="mr-2"
              />
              {t('Use regex')}
            </label>
          </div>
          <Textarea
            value={customPattern}
            onChange={(e) => setCustomPattern(e.target.value)}
            placeholder={isRegex ? t('Regular expression pattern') : t('Text to match in path')}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={customUnselectDialogOpen.off}>
              {t('Cancel')}
            </Button>
            <Button onClick={() => handleCustomSelect(true)}>
              {t('Unselect')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function invertSelection<T extends BaseEntry & Partial<RefEntry>>(
  data: T[],
  setFn: (updater: (v: RowSelection) => RowSelection) => void,
) {
  const paths = getPathsFromEntries(data);
  setFn((old) => convertRowSelection(old, paths));
}

function convertRowSelection(old: RowSelection, paths: string[]): RowSelection {
  const selected = new Set(getRowSelectionKeys(old));
  const unselected = paths.filter((v) => !selected.has(v));
  const result = pathsToRowSelection(unselected);
  return result;
}

function pathsToRowSelection(paths: string[]): RowSelection {
  const obj = Object.fromEntries(
    paths.map((v) => {
      return [v, true];
    }),
  );
  return obj;
}

function groupBy<T extends RefEntry>(list: T[]): T[][] {
  const map: Map<number, T[]> = new Map();

  for (const item of list) {
    if (!item.groupId) {
      continue;
    }
    const v = map.get(item.groupId);
    if (v) {
      v.push(item);
    } else {
      map.set(item.groupId, [item]);
    }
  }

  return Array.from(map.values());
}

interface WithRaw {
  raw: Record<string, any>;
}

function selectItem<T extends BaseEntry & RefEntry & WithRaw>(
  data: T[],
  type: 'size' | 'date' | 'resolution',
  dir: 'asc' | 'desc',
  inverse: boolean = false
): RowSelection {
  const paths: string[] = [];
  let compareFn: (<T extends WithRaw>(a: T, b: T) => T) | null = null;
  if (type === 'size' && dir === 'asc') {
    compareFn = pickBiggest;
  } else if (type === 'size' && dir === 'desc') {
    compareFn = pickSmallest;
  } else if (type === 'date' && dir === 'asc') {
    compareFn = pickNewst;
  } else if (type === 'date' && dir === 'desc') {
    compareFn = pickOldest;
  } else if (type === 'resolution' && dir === 'asc') {
    compareFn = pickHighestResolution;
  } else if (type === 'resolution' && dir === 'desc') {
    compareFn = pickLowestResolution;
  }
  if (!compareFn) {
    return {};
  }
  
  const groups = groupBy(data);
  for (const group of groups) {
    if (!group.length) {
      continue;
    }
    
    if (inverse) {
      // Select all except the one that matches the compare function
      const selectedItem = group.reduce(compareFn);
      const otherItems = group.filter(item => item.path !== selectedItem.path);
      paths.push(...otherItems.map(item => item.path));
    } else {
      // Select only the one that matches the compare function
      const path = group.reduce(compareFn).path;
      paths.push(path);
    }
  }
  
  return pathsToRowSelection(paths);
}

function pickBiggest<T extends WithRaw>(a: T, b: T): T {
  return a.raw.size >= b.raw.size ? a : b;
}

function pickSmallest<T extends WithRaw>(a: T, b: T): T {
  return a.raw.size <= b.raw.size ? a : b;
}

function pickNewst<T extends WithRaw>(a: T, b: T): T {
  return a.raw.modified_date >= b.raw.modified_date ? a : b;
}

function pickOldest<T extends WithRaw>(a: T, b: T): T {
  return a.raw.modified_date <= b.raw.modified_date ? a : b;
}

function pickHighestResolution<T extends WithRaw>(a: T, b: T): T {
  return a.raw.width * a.raw.height >= b.raw.width * b.raw.height ? a : b;
}

function pickLowestResolution<T extends WithRaw>(a: T, b: T): T {
  return a.raw.width * a.raw.height <= b.raw.width * b.raw.height ? a : b;
}
