import { Button } from './shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './shadcn/tooltip';

interface TooltipButtonProps extends React.ComponentProps<typeof Button> {
  tooltip: React.ReactNode;
}

export function TooltipButton({ ref, tooltip, ...props }: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button ref={ref} variant="ghost" size="icon" {...props} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
