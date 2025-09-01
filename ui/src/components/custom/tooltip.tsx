import type * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { TooltipContent as TooltipContentPrimitive } from '../shadcn/tooltip';

const tooltipContentVariants = cva('border text-accent-foreground', {
  variants: {
    variant: {
      default: 'border-primary bg-blue-100 dark:bg-blue-950',
      destructive: 'border-destructive bg-red-100 dark:bg-red-950',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof tooltipContentVariants>
>(({ variant, className, ...props }, ref) => {
  return (
    <TooltipContentPrimitive
      ref={ref}
      sideOffset={2}
      className={tooltipContentVariants({ variant, className })}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipContentPrimitive.displayName;
