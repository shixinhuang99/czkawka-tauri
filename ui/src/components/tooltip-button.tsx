import { forwardRef } from 'react';
import { TooltipContent } from './custom/tooltip';
import { Button, type ButtonProps } from './shadcn/button';
import { Tooltip, TooltipTrigger } from './shadcn/tooltip';

interface TooltipButtonProps extends ButtonProps {
  tooltip: React.ReactNode;
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({ tooltip, ...props }: TooltipButtonProps, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} variant="ghost" size="icon" {...props} />
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  },
);
TooltipButton.displayName = 'TooltipButton';
