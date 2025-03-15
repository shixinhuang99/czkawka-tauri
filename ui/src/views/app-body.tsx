import { useAtomValue } from 'jotai';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { Progress } from '~/components';
import { Tools } from '~/consts';
import { BigFiles } from './big-files';
import { DuplicateFiles } from './duplicate-files';

export function AppBody() {
  const progress = useAtomValue(progressAtom);
  const currentTool = useAtomValue(currentToolAtom);

  return (
    <div className="flex-1 flex flex-col w-px">
      <AllTable />
      {progress.tool === currentTool && (
        <div className="h-20 border-t px-3">
          {progress.stopping ? (
            <div className="h-full flex justify-center items-center">
              Stopping scan, please wait...
            </div>
          ) : (
            <>
              <div className="text-center h-6">{progress.data.stepName}</div>
              <ProgressWrap
                label="Current stage:"
                value={progress.data.currentProgress}
              />
              <ProgressWrap
                label="All stages:"
                value={progress.data.allProgress}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AllTable() {
  const currentTool = useAtomValue(currentToolAtom);

  if (currentTool === Tools.DuplicateFiles) {
    return <DuplicateFiles />;
  }

  if (currentTool === Tools.BigFiles) {
    return <BigFiles />;
  }

  return <div>todo</div>;
}

function ProgressWrap(props: { label: string; value: number }) {
  const { label, value } = props;

  if (value < -0.001) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div className="shrink-0 w-28">{label}</div>
      <Progress value={value} />
      <div className="w-12 shrink-0 text-right">{value}%</div>
    </div>
  );
}
