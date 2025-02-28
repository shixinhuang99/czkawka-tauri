import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/shadcn/resizable';
import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { AppHeader } from '~/views/app-header';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <TooltipProvider delayDuration={100} skipDelayDuration={90}>
        <AppHeader />
        <ResizablePanelGroup
          className="select-none"
          direction="horizontal"
          autoSaveId="main"
        >
          <ResizablePanel defaultSize={20} minSize={20} maxSize={30}>
            <div>todo</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <div>todo</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
      <Toaster />
    </div>
  );
}
