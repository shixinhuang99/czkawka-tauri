import { openUrl } from '@tauri-apps/plugin-opener';
import { TooltipButton } from '~/components';
import { GitHub } from '~/components/icons';
import { SettingsButton } from './settings';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <div
      className="w-full h-11 flex justify-end items-center px-4 py-1 border-b border-border/50 dark:border-border"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-1.5">
        <SettingsButton />
        <ThemeToggle />
        <ViewGitHubButton />
      </div>
    </div>
  );
}

function ViewGitHubButton() {
  return (
    <TooltipButton
      tooltip="View GitHub"
      onClick={() => openUrl(REPOSITORY_URL)}
    >
      <GitHub />
    </TooltipButton>
  );
}
