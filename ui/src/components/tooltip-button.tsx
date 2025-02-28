import { forwardRef } from 'react';
import { Button, type ButtonProps } from './shadcn/button';
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from './shadcn/tooltip';

interface TooltipButtonProps extends ButtonProps {
  tooltip: React.ReactNode;
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  (props: TooltipButtonProps, ref) => {
    const { tooltip, ...restProps } = props;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} variant="ghost" size="icon" {...restProps} />
        </TooltipTrigger>
        <TooltipContent>
          <TooltipArrow />
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  },
);
TooltipButton.displayName = 'TooltipButton';
