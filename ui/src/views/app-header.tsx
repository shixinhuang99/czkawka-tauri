import { openUrl } from '@tauri-apps/plugin-opener';
import { CommonHeader, TooltipButton } from '~/components';
import { GitHub } from '~/components/icons';
import { SettingsButton } from './settings';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <CommonHeader>
      <div className="flex items-center gap-1">
        <img className="size-10" src="/icon.ico" alt="czkawka icon" />
        <span className="font-bold text-lg">{PKG_NAME}</span>
        <span className="font-light text-xs ml-2">{PKG_VERSION}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <SettingsButton />
        <ViewGitHubButton />
        <ThemeToggle />
      </div>
    </CommonHeader>
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
