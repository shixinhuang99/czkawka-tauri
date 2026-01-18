import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ClockIcon,
  FileQuestionIcon,
  FilesIcon,
  FileWarningIcon,
  FileXIcon,
  FolderOpenIcon,
  HardDriveIcon,
  ImageIcon,
  LinkIcon,
  LoaderCircleIcon,
  MusicIcon,
  VideoIcon,
} from 'lucide-react';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { restoreFilterAtom } from '~/atom/table';
import { Button, ScrollArea } from '~/components';
import { Tools } from '~/consts';
import { useT } from '~/hooks';
import { getDataTauriDragRegionProp } from '~/styles';
import { blueBgBorderVariants } from '~/styles/variants';
import type { ToolsValues } from '~/types';
import { cn } from '~/utils/cn';

const toolSet = new Set<string>(Object.values(Tools));

function isValidTool(s: string): s is ToolsValues {
  return toolSet.has(s);
}

const toolIcons: Record<
  ToolsValues,
  React.ComponentType<{ className?: string }>
> = {
  [Tools.DuplicateFiles]: FilesIcon,
  [Tools.EmptyFolders]: FolderOpenIcon,
  [Tools.BigFiles]: HardDriveIcon,
  [Tools.EmptyFiles]: FileXIcon,
  [Tools.TemporaryFiles]: ClockIcon,
  [Tools.SimilarImages]: ImageIcon,
  [Tools.SimilarVideos]: VideoIcon,
  [Tools.MusicDuplicates]: MusicIcon,
  [Tools.InvalidSymlinks]: LinkIcon,
  [Tools.BrokenFiles]: FileWarningIcon,
  [Tools.BadExtensions]: FileQuestionIcon,
};

export function ToolTabs() {
  const [currentTool, setCurrentTool] = useAtom(currentToolAtom);
  const progress = useAtomValue(progressAtom);
  const t = useT();
  const restoreFilter = useSetAtom(restoreFilterAtom);

  const handleClick = (name: string) => {
    if (!isValidTool(name)) {
      return;
    }
    setCurrentTool(name);
    restoreFilter();
  };

  return (
    <div className={cn('h-full w-[220px] border-r flex flex-col')}>
      <div
        className={cn(
          'flex items-center gap-1 pb-3 pr-3 border-b pl-4 h-[85px]',
          PLATFORM === 'macOS' ? 'pt-8' : 'pt-3',
        )}
        {...getDataTauriDragRegionProp()}
      >
        <div className="flex items-end gap-1">
          <img className="size-8" src="/icon.ico" alt="czkawka icon" />
          <span className="font-serif tracking-wider">{PKG_NAME}</span>
          <span className="font-extralight text-xs pb-[3px]">
            {PKG_VERSION}
          </span>
        </div>
      </div>
      <ScrollArea className="px-3 flex-1 shadow-inner">
        {Object.values(Tools).map((name) => {
          const Icon = toolIcons[name];
          return (
            <Button
              key={name}
              className={cn(
                'w-full h-10 justify-between mt-1 cursor-pointer last:mb-1',
                currentTool === name &&
                  blueBgBorderVariants({ variant: 'withHover' }),
              )}
              tabIndex={-1}
              variant="ghost"
              onClick={() => handleClick(name)}
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                {t(name)}
              </div>
              {progress.tool === name && (
                <LoaderCircleIcon className="animate-spin" />
              )}
            </Button>
          );
        })}
      </ScrollArea>
    </div>
  );
}
