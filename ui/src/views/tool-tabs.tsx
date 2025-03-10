import { useAtom } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { toolsCfgAtom } from '~/atom/primitive';
import { Button, ScrollArea } from '~/components';
import { Tools } from '~/consts';

export function ToolTabs() {
  const [toolsCfg, setToolsCfg] = useAtom(toolsCfgAtom);

  const handleClick = (name: string) => {
    setToolsCfg({ ...toolsCfg, current: name });
  };

  return (
    <ScrollArea className="h-full px-3 pb-1">
      {Object.values(Tools).map((name) => {
        return (
          <Button
            key={name}
            className="w-full h-12 justify-between mt-1 cursor-pointer"
            tabIndex={-1}
            variant={toolsCfg.current === name ? 'default' : 'ghost'}
            onClick={() => handleClick(name)}
          >
            {name}
            {toolsCfg.inProgress === name && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
        );
      })}
    </ScrollArea>
  );
}
