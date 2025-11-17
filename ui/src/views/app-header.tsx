import { openUrl } from '@tauri-apps/plugin-opener';
import { TooltipButton } from '~/components';
import { GitHub } from '~/components/icons';
import { useT } from '~/hooks';
import { SettingsButton } from './settings';

export function AppHeader() {
  return (
    <div
      className="w-full h-11 flex justify-end items-center px-4 py-1 border-b border-border/50 dark:border-border"
      data-tauri-drag-region={PLATFORM === 'darwin' ? true : undefined}
    >
      <div className="flex items-center gap-1.5">
        <SettingsButton />
        <ViewGitHubButton />
      </div>
    </div>
  );
}

function ViewGitHubButton() {
  const t = useT();

  return (
    <TooltipButton
      tooltip={t('viewSourceCode')}
      onClick={() => openUrl(REPOSITORY_URL)}
    >
      <GitHub />
    </TooltipButton>
  );
}
