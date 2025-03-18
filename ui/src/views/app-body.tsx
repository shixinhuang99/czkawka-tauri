import { useAtomValue } from 'jotai';
import { currentToolAtom, progressAtom } from '~/atom/primitive';
import { Progress } from '~/components';
import { Tools } from '~/consts';
import { BadExtensions } from './bad-extensions';
import { BigFiles } from './big-files';
import { BrokenFiles } from './broken-files';
import { DuplicateFiles } from './duplicate-files';
import { EmptyFiles } from './empty-files';
import { EmptyFolders } from './empty-folders';
import { InvalidSymlinks } from './invalid-symlinks';
import { MusicDuplicates } from './music-duplicates';
import { SimilarImages } from './similar-images';
import { SimilarVideos } from './similar-videos';
import { TemporaryFiles } from './temporary-files';

const tableMap: Record<string, () => React.JSX.Element> = {
  [Tools.DuplicateFiles]: DuplicateFiles,
  [Tools.EmptyFolders]: EmptyFolders,
  [Tools.BigFiles]: BigFiles,
  [Tools.EmptyFiles]: EmptyFiles,
  [Tools.TemporaryFiles]: TemporaryFiles,
  [Tools.SimilarImages]: SimilarImages,
  [Tools.SimilarVideos]: SimilarVideos,
  [Tools.MusicDuplicates]: MusicDuplicates,
  [Tools.InvalidSymlinks]: InvalidSymlinks,
  [Tools.BrokenFiles]: BrokenFiles,
  [Tools.BadExtensions]: BadExtensions,
};

export function AppBody() {
  const progress = useAtomValue(progressAtom);
  const currentTool = useAtomValue(currentToolAtom);

  const Table = tableMap[currentTool] || Fallback;

  return (
    <div className="flex-1 flex flex-col w-px">
      <Table />
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

function Fallback() {
  return <div>Something wrong</div>;
}
