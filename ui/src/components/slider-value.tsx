import { cn } from '~/utils/cn';

interface SliderValueProps extends React.ComponentPropsWithoutRef<'span'> {
  value: number;
  max: number;
}

export function SliderValue({
  value,
  max,
  className,
  ...props
}: SliderValueProps) {
  return (
    <span className={cn('flex-shrink-0 text-center', className)} {...props}>
      {value}/{max}
    </span>
  );
}
