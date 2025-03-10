import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/shadcn/resizable';
import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { AppHeader } from '~/views/app-header';
import { ToolTabs } from '~/views/tool-tabs';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <TooltipProvider delayDuration={100} skipDelayDuration={90}>
        <AppHeader />
        <ResizablePanelGroup
          className="select-none"
          direction="vertical"
          autoSaveId="outer"
        >
          <ResizablePanel>
            <ResizablePanelGroup
              className="select-none"
              direction="horizontal"
              autoSaveId="inner"
            >
              <ResizablePanel defaultSize={20} minSize={20} maxSize={20}>
                <ToolTabs />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>
                <div>2</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30} minSize={25} maxSize={30}>
            3
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
      <Toaster />
    </div>
  );
}
