import { listen } from '@tauri-apps/api/event';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  Ban,
  FolderLock,
  FolderSymlink,
  Search,
  SquareMousePointer,
  Trash2,
} from 'lucide-react';
import { useEffect } from 'react';
import {
  bigFilesAtom,
  currentToolAtom,
  logsAtom,
  progressAtom,
} from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { OperationButton } from '~/components';
import { Tools, getDefaultProgress } from '~/consts';
import { ipc } from '~/ipc';
import type { ProgressData, RawFileEntry, ScanCmd, ScanResult } from '~/types';
import { fmtDate, fmtFileSize, pathBaseName } from '~/utils/common';
import { ToolSettings } from './tool-settings';

const scanCmdMap: Record<string, ScanCmd> = {
  [Tools.DuplicateFiles]: 'scan_duplicate_files',
  [Tools.EmptyFolders]: 'scan_empty_folders',
  [Tools.BigFiles]: 'scan_big_files',
  [Tools.EmptyFiles]: 'scan_empty_files',
  [Tools.TemporaryFiles]: 'scan_temporary_files',
  [Tools.SimilarImages]: 'scan_similar_images',
  [Tools.SimilarVideos]: 'scan_similar_videos',
  [Tools.MusicDuplicates]: 'scan_music_duplicates',
  [Tools.InvalidSymlinks]: 'scan_invalid_symlinks',
  [Tools.BrokenFiles]: 'scan_broken_files',
  [Tools.BadExtensions]: 'scan_bad_extensions',
};

export function Operations() {
  const currentTool = useAtomValue(currentToolAtom);
  const settings = useAtomValue(settingsAtom);
  const [progress, setProgress] = useAtom(progressAtom);
  const setLogs = useSetAtom(logsAtom);
  const [bigFiles, setBigFiles] = useAtom(bigFilesAtom);

  useEffect(() => {
    listen<ScanResult<RawFileEntry>>('scan-result', (e) => {
      setProgress(getDefaultProgress());
      setLogs(e.payload.message);
      if (e.payload.cmd === 'scan_big_files') {
        setBigFiles(
          e.payload.list.map((fe) => {
            return {
              size: fmtFileSize(fe.size),
              fileName: pathBaseName(fe.path),
              path: fe.path,
              modifiedDate: fmtDate(fe.modified_date),
            };
          }),
        );
      }
    });
    ipc.listenScanProgress();
    listen<ProgressData>('scan-progress', (e) => {
      setProgress((old) => {
        return { ...old, data: e.payload };
      });
    });
  }, []);

  const handleScan = () => {
    if (progress.tool) {
      return;
    }
    setProgress({ ...progress, tool: currentTool });
    ipc.scan(scanCmdMap[currentTool], settings);
  };

  const handleStopScan = () => {
    if (progress.stopping) {
      return;
    }
    setProgress({ ...progress, stopping: true });
    ipc.stopScan();
  };

  const otherButtonsDisabled = (() => {
    let base = !!progress.tool;
    if (currentTool === Tools.BigFiles) {
      base &&= !!bigFiles.length;
    }
    return base;
  })();

  return (
    <div className="flex gap-1">
      {!progress.tool && (
        <OperationButton
          disabled={!settings.includedDirectories.length}
          onClick={handleScan}
        >
          <Search />
          Scan
        </OperationButton>
      )}
      {!!progress.tool && (
        <OperationButton disabled={progress.stopping} onClick={handleStopScan}>
          <Ban />
          Stop
        </OperationButton>
      )}
      <ToolSettings />
      <OperationButton disabled={otherButtonsDisabled}>
        <SquareMousePointer />
        Select
      </OperationButton>
      <OperationButton disabled={otherButtonsDisabled}>
        <FolderSymlink />
        Move
      </OperationButton>
      <OperationButton disabled={otherButtonsDisabled}>
        <Trash2 />
        Delete
      </OperationButton>
      <OperationButton disabled={otherButtonsDisabled}>
        <FolderLock />
        Save
      </OperationButton>
    </div>
  );
}
