import { eventPreventDefault } from '~/utils/event';
import {
  Select as RawSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './shadcn/select';

interface SelectProps {
  name?: string;
  value?: string;
  onChange?: (v: string) => void;
  options: { label: string; value: string }[];
  onPreventDialogCloseChange?: (v: boolean) => void;
  placeholder?: string;
}

export function Select(props: SelectProps) {
  const {
    name,
    value,
    onChange,
    options,
    onPreventDialogCloseChange,
    placeholder,
  } = props;

  return (
    <RawSelect
      name={name}
      value={value}
      onValueChange={onChange}
      onOpenChange={onPreventDialogCloseChange}
    >
      <SelectTrigger className="flex-1 dark:bg-black">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent onCloseAutoFocus={eventPreventDefault}>
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
