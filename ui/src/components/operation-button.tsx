import { forwardRef } from 'react';
import { Button, type ButtonProps } from '~/components/shadcn/button';
import { blueBgBorderVariants } from '~/styles/variants';
import { cn } from '~/utils/cn';

export const OperationButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="secondary"
        className={cn(
          'border-transparent',
          blueBgBorderVariants({ variant: 'hoverOnly' }),
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
