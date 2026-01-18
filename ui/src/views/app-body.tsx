import { useAtomValue } from 'jotai';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { Progress } from '~/components';
import { useT } from '~/hooks';
import { ScanResultTable } from './scan-result-table';

export function AppBody() {
  const t = useT();
  const progress = useAtomValue(progressAtom);
  const currentTool = useAtomValue(currentToolAtom);

  return (
    <div className="flex-1 flex flex-col w-full h-px pb-[3px]">
      <ScanResultTable className="flex-1 rounded-none border-none grow" />
      {progress.tool === currentTool && (
        <div className="h-20 border-t px-3">
          {progress.stopping ? (
            <div className="h-full flex justify-center items-center">
              {t('stoppingScan')}
            </div>
          ) : (
            <>
              <div className="text-center h-6">{progress.data.stepName}</div>
              <ProgressWrap
                label={t('currentStage')}
                value={progress.data.currentProgress}
              />
              <ProgressWrap
                label={t('allStages')}
                value={progress.data.allProgress}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressWrap(props: { label: string; value: number }) {
  const { label, value } = props;

  if (value < -0.001) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div className="shrink-0 w-28">{label}:</div>
      <Progress value={value} />
      <div className="w-12 shrink-0 text-right">{value}%</div>
    </div>
  );
}
