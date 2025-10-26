import { forwardRef } from 'react';
import { cn } from '~/utils/cn';
import { TooltipContent } from './custom/tooltip';
import { Button, type ButtonProps } from './shadcn/button';
import { Tooltip, TooltipTrigger } from './shadcn/tooltip';

interface TooltipButtonProps extends ButtonProps {
  tooltip: React.ReactNode;
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({ tooltip, disabled, className, ...props }: TooltipButtonProps, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(disabled && 'cursor-not-allowed')}>
            <Button
              ref={ref}
              variant="ghost"
              size="icon"
              disabled={disabled}
              className={cn(disabled && 'pointer-events-none', className)}
              {...props}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  },
);
TooltipButton.displayName = 'TooltipButton';
