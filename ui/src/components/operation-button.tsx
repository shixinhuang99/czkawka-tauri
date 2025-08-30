import { Button } from '~/components/shadcn/button';
import { cn } from '~/utils/cn';

export function OperationButton({
  ref,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      ref={ref}
      variant="secondary"
      className={cn(
        'hover:bg-primary hover:text-primary-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
