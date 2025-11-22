import type { SelectProps as SelectPrimitiveProps } from '@radix-ui/react-select';
import { cn } from '~/utils/cn';
import {
  Select as RawSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './shadcn/select';

interface SelectProps extends SelectPrimitiveProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  return (
    <RawSelect {...props}>
      <SelectTrigger className={cn('bg-white dark:bg-gray-900', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          return (
            <SelectItem
              className="hover:bg-accent hover:text-accent-foreground"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </RawSelect>
  );
}
