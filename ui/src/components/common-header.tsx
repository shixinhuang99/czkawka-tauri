import { cn } from '~/utils/cn';

export function CommonHeader(props: React.ComponentProps<'div'>) {
  const { className, ...restProps } = props;
  return (
    <div
      className={cn(
        'w-full h-14 flex justify-between items-center px-4 py-1 border-b border-border/50 dark:border-border',
        className,
      )}
      {...restProps}
    />
  );
}
