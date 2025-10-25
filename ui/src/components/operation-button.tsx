import { forwardRef } from 'react';
import { Button, type ButtonProps } from '~/components/shadcn/button';
import { blueBgBorderVariants } from '~/styles/variants';
import { cn } from '~/utils/cn';

export const OperationButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { children, className, ...restProps } = props;

    return (
      <Button
        ref={ref}
        variant="secondary"
        className={cn(
          'border-transparent',
          blueBgBorderVariants({ variant: 'hoverOnly' }),
          className,
        )}
        {...restProps}
      >
        {children}
      </Button>
    );
  },
);
