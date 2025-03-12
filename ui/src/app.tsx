import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { AppBody } from '~/views/app-body';
import { AppHeader } from '~/views/app-header';
import { BottomBar } from '~/views/bottom-bar';
import { ToolTabs } from '~/views/tool-tabs';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <TooltipProvider delayDuration={100} skipDelayDuration={90}>
        <AppHeader />
        <div className="flex-1 flex h-px">
          <ToolTabs />
          <AppBody />
        </div>
        <BottomBar />
      </TooltipProvider>
      <Toaster />
    </div>
  );
}
