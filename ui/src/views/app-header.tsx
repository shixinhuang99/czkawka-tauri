import { CommonHeader, TooltipButton } from '~/components';
import { GitHub } from '~/components/icons';
import { ipc } from '~/ipc';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <CommonHeader>
      <div className="flex items-center gap-1">
        <img className="size-10" src="/icon.ico" />
        <span className="font-bold text-lg">{PKG_NAME}</span>
        <span className="font-light text-xs ml-2">{PKG_VERSION}</span>
      </div>
      <div className="flex items-center gap-1.5">
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
      variant="ghost"
      size="icon"
      onClick={() => ipc.viewGitHub()}
    >
      <GitHub />
    </TooltipButton>
  );
}
