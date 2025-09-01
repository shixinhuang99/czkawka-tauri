import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { AppBody } from '~/views/app-body';
import { AppHeader } from '~/views/app-header';
import { BottomBar } from '~/views/bottom-bar';
import { ToolTabs } from '~/views/tool-tabs';

export default function App() {
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
