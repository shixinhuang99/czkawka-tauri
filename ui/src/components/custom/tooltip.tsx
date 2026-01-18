import type * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { blueBgBorderVariants } from '~/styles/variants';
import { TooltipContent as TooltipContentPrimitive } from '../shadcn/tooltip';

export const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof blueBgBorderVariants>
>(({ variant, className, ...props }, ref) => {
  return (
    <TooltipContentPrimitive
      ref={ref}
      sideOffset={2}
      className={blueBgBorderVariants({ variant, className })}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipContentPrimitive.displayName;
