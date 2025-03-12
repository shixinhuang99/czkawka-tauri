import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  Ban,
  FolderLock,
  FolderSymlink,
  Search,
  SquareMousePointer,
  Trash2,
} from 'lucide-react';
import { scanBigFilesAtom } from '~/atom/big-files';
import { toolsCfgAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { Button } from '~/components';
import { toastError } from '~/components';
import type { ButtonProps } from '~/components/shadcn/button';
import { Tools } from '~/consts';
import { cn } from '~/utils/cn';

export function Operation() {
  const [toolsCfg, setToolsCfg] = useAtom(toolsCfgAtom);
  const settings = useAtomValue(settingsAtom);
  const scanBigFiles = useSetAtom(scanBigFilesAtom);

  const setInProgress = (v: string) => {
    setToolsCfg({ ...toolsCfg, inProgress: v });
  };

  const handleScan = async () => {
    try {
      if (toolsCfg.current === Tools.BigFiles) {
        setInProgress(Tools.BigFiles);
        await scanBigFiles();
      }
    } catch (error) {
      toastError('Scan failure', error);
    } finally {
      setInProgress('');
    }
  };

  return (
    <div className="flex gap-1">
      <OperationButton
        className="mr-2"
        disabled={!toolsCfg.inProgress && !settings.includedDirectories.length}
        onClick={handleScan}
      >
        {toolsCfg.inProgress ? (
          <>
            <Ban />
            Stop
          </>
        ) : (
          <>
            <Search />
            Scan
          </>
        )}
      </OperationButton>
      <OperationButton>
        <SquareMousePointer />
        Select
      </OperationButton>
      <OperationButton>
        <FolderSymlink />
        Move
      </OperationButton>
      <OperationButton>
        <Trash2 />
        Delete
      </OperationButton>
      <OperationButton>
        <FolderLock />
        Save
      </OperationButton>
    </div>
  );
}

function OperationButton(props: ButtonProps) {
  const { children, className, ...restProps } = props;

  return (
    <Button
      variant="secondary"
      className={cn(
        'hover:bg-primary hover:text-primary-foreground',
        className,
      )}
      {...restProps}
    >
      {children}
    </Button>
  );
}
