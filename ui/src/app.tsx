import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { AppHeader } from '~/views/app-header';
import { ToolTabs } from '~/views/tool-tabs';
import { BottomBar } from '~/views/bottom-bar';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <TooltipProvider delayDuration={100} skipDelayDuration={90}>
        <AppHeader />
        <div className="flex-1 flex h-px">
          <ToolTabs />
          <div className="flex-1">todo</div>
        </div>
        <BottomBar />
      </TooltipProvider>
      <Toaster />
    </div>
  );
}
