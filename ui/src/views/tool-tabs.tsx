import { useAtom, useAtomValue } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { Button, ScrollArea } from '~/components';
import { Tools } from '~/consts';
import type { ToolsValues } from '~/types';
import { cn } from '~/utils/cn';

const toolSet = new Set<string>(Object.values(Tools));

function isValidTool(s: string): s is ToolsValues {
  return toolSet.has(s);
}

export function ToolTabs() {
  const [currentTool, setCurrentTool] = useAtom(currentToolAtom);
  const progress = useAtomValue(progressAtom);
  const { t } = useTranslation();

  const handleClick = (name: string) => {
    if (!isValidTool(name)) {
      return;
    }
    setCurrentTool(name);
  };

  return (
    <div
      className={cn(
        'h-full w-[200px] border-r flex flex-col',
        PLATFORM === 'darwin' && 'pt-5',
      )}
    >
      <div className="flex items-end gap-1 p-3">
        <img className="size-8" src="/icon.ico" alt="czkawka icon" />
        <span className="font-serif">{PKG_NAME}</span>
        <span className="font-extralight text-xs pl-1 pb-[3px]">
          {PKG_VERSION}
        </span>
      </div>
      <ScrollArea className="px-3 pb-1 flex-1">
        {Object.values(Tools).map((name) => {
          return (
            <Button
              key={name}
              className="w-full h-10 justify-between mt-1 cursor-pointer"
              tabIndex={-1}
              variant={currentTool === name ? 'default' : 'ghost'}
              onClick={() => handleClick(name)}
            >
              {t(name)}
              {progress.tool === name && (
                <LoaderCircle className="animate-spin" />
              )}
            </Button>
          );
        })}
      </ScrollArea>
    </div>
  );
}
