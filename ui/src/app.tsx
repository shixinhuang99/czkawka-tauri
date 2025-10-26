import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { toastError } from '~/components/toast';
import { useOnceEffect } from '~/hooks';
import { t } from '~/i18n';
import { AppBody } from '~/views/app-body';
import { AppHeader } from '~/views/app-header';
import { BottomBar } from '~/views/bottom-bar';
import { ToolTabs } from '~/views/tool-tabs';

export default function App() {
  useOnceEffect(() => {
    window.addEventListener('error', (event) => {
      event.preventDefault();
      toastError(t('unexpectedError'), event.error || event.message);
    });
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      toastError(t('unexpectedError'), event.reason);
    });
  });

  return (
    <div className="h-screen w-screen flex flex-col">
      <TooltipProvider delayDuration={400}>
        <div className="flex-1 flex h-px">
          <ToolTabs />
          <div className="flex flex-col flex-1 w-px">
            <AppHeader />
            <AppBody />
          </div>
        </div>
        <BottomBar />
      </TooltipProvider>
      <Toaster />
    </div>
  );
}
