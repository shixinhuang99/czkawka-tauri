import { forwardRef } from 'react';
import { scrollBar } from '~/styles';
import { cn } from '~/utils/cn';
import { Textarea as TextareaPrimitive } from '../shadcn/textarea';

export const Textarea = forwardRef<
  React.ElementRef<typeof TextareaPrimitive>,
  React.ComponentPropsWithoutRef<typeof TextareaPrimitive>
>(({ className, ...props }, ref) => {
  return (
    <TextareaPrimitive
      ref={ref}
      className={cn(
        scrollBar(),
        'dark:bg-gray-900 placeholder:italic break-all',
        className,
      )}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      {...props}
    />
  );
});
Textarea.displayName = TextareaPrimitive.displayName;
