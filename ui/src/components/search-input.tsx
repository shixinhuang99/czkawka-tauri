import { SearchIcon } from 'lucide-react';
import { cn } from '~/utils/cn';
import { Input } from './shadcn/input';

interface SearchInputProps
  extends Pick<
    React.ComponentProps<'input'>,
    'name' | 'value' | 'placeholder' | 'className'
  > {
  onChange: (v: string) => void;
}

export function SearchInput(props: SearchInputProps) {
  const { className, onChange, ...restProps } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn('relative select-none', className)}>
      <SearchIcon className="pointer-events-auto absolute left-2.5 size-4 top-1/2 -translate-y-1/2 select-none text-muted-foreground" />
      <Input
        className="pl-8 placeholder:italic dark:bg-gray-900"
        onChange={handleChange}
        {...restProps}
      />
    </div>
  );
}
