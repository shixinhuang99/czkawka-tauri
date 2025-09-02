import type { SelectProps as SelectPrimitiveProps } from '@radix-ui/react-select';
import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { Button } from './shadcn/button';
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
  trigger?: React.ReactNode;
}

export function Select({
  options,
  placeholder,
  trigger,
  ...props
}: SelectProps) {
  return (
    <RawSelect {...props}>
      {trigger ?? (
        <SelectTrigger className="flex-1 dark:bg-gray-900">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      )}
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

export const SelectIconTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} asChild {...props}>
    <Button variant="ghost" size="icon">
      {children}
    </Button>
  </SelectPrimitive.Trigger>
));
SelectIconTrigger.displayName = 'SelectIconTrigger';
