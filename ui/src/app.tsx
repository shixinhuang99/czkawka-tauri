import { useRef, useState } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/shadcn/resizable';
import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { toastError } from '~/components/toast';
import { useOnceEffect } from '~/hooks';
import { t } from '~/i18n';
import { AppBody } from '~/views/app-body';
import { AppHeader } from '~/views/app-header';
import { BottomBar } from '~/views/bottom-bar';
import { ToolTabs } from '~/views/tool-tabs';

const PANEL_SIZE = 35;

export default function App() {
  const [bottomPanelMinSize, setBottomPanelMinSize] = useState(PANEL_SIZE);
  const [bottomPanelSize, setBottomPanelSize] = useState(PANEL_SIZE);
  const headerRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);

  const handleResetPanelSize = () => {
    if (bottomPanelRef.current) {
      bottomPanelRef.current.resize(PANEL_SIZE);
    }
  };

  useOnceEffect(() => {
    if (!headerRef.current) {
      return;
    }

    const calculateMinSize = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const padding = 0.25 * 16 * 2;
        const totalHeight = headerHeight + padding;
        const screenHeight = window.innerHeight;
        const percentage = (totalHeight / screenHeight) * 100;
        setBottomPanelMinSize(percentage);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      calculateMinSize();
    });

    resizeObserver.observe(headerRef.current);
    resizeObserver.observe(document.body);

    calculateMinSize();
  });

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
        <ResizablePanelGroup direction="vertical" autoSaveId="app-layout">
          <ResizablePanel>
            <div className="flex h-full">
              <ToolTabs />
              <div className="flex flex-col flex-1 w-px">
                <AppHeader />
                <AppBody />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle onDoubleClick={handleResetPanelSize} />
          <ResizablePanel
            ref={bottomPanelRef}
            defaultSize={PANEL_SIZE}
            minSize={bottomPanelMinSize}
            maxSize={50}
            onResize={setBottomPanelSize}
          >
            <BottomBar headerRef={headerRef} panelSize={bottomPanelSize} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
      <Toaster />
    </div>
  );
}
