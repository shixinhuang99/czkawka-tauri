import { Toaster } from '~/components/shadcn/sonner';
import { TooltipProvider } from '~/components/shadcn/tooltip';
import { AppHeader } from '~/views/app-header';

export default function App() {
  return (
    <div className="h-screen w-screen">
      <TooltipProvider delayDuration={100} skipDelayDuration={90}>
        <AppHeader />
      </TooltipProvider>
      <Toaster />
    </div>
  );
}
