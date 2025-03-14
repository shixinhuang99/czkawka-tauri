import { forwardRef } from 'react';
import { Button, type ButtonProps } from '~/components/shadcn/button';
import { cn } from '~/utils/cn';

export const OperationButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { children, className, ...restProps } = props;

    return (
      <Button
        ref={ref}
        variant="secondary"
        className={cn(
          'hover:bg-primary hover:text-primary-foreground',
          className,
        )}
        {...restProps}
      >
        {children}
      </Button>
    );
  },
);
