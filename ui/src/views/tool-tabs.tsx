import { useAtom, useAtomValue } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { Button, ScrollArea } from '~/components';
import { Tools } from '~/consts';
import type { ToolsValues } from '~/types';

const toolSet = new Set<string>(Object.values(Tools));

function isValidTool(s: string): s is ToolsValues {
  return toolSet.has(s);
}

export function ToolTabs() {
  const [currentTool, setCurrentTool] = useAtom(currentToolAtom);
  const progress = useAtomValue(progressAtom);

  const handleClick = (name: string) => {
    if (!isValidTool(name)) {
      return;
    }
    setCurrentTool(name);
  };

  return (
    <ScrollArea className="h-full w-[200px] border-r px-3 pb-1 shrink-0">
      {Object.values(Tools).map((name) => {
        return (
          <Button
            key={name}
            className="w-full h-10 justify-between mt-1 cursor-pointer"
            tabIndex={-1}
            variant={currentTool === name ? 'default' : 'ghost'}
            onClick={() => handleClick(name)}
          >
            {name}
            {progress.tool === name && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
        );
      })}
    </ScrollArea>
  );
}
