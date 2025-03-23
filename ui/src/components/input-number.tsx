import { useEffect, useState } from 'react';
import { cn } from '~/utils/cn';
import { Input } from './shadcn/input';

interface InputNumberProps
  extends Omit<React.ComponentProps<typeof Input>, 'value'> {
  value?: number;
  minValue: number;
  maxValue?: number;
}

export function InputNumber(props: InputNumberProps) {
  const {
    minValue,
    maxValue = 2 ** 31 - 1,
    className,
    value,
    onChange = () => {},
    ...restProps
  } = props;

  const [draftValue, setDraftValue] = useState(value?.toString() ?? '');

  useEffect(() => {
    setDraftValue(value?.toString() ?? '');
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const valueAfterBlur = Number.parseInt(e.target.value, 10);
    if (
      Number.isNaN(valueAfterBlur) ||
      !Number.isSafeInteger(valueAfterBlur) ||
      valueAfterBlur < minValue ||
      valueAfterBlur > maxValue
    ) {
      setDraftValue(value?.toString() ?? '');
      return;
    }
    onChange(e);
  };

  return (
    <Input
      className={cn('dark:bg-gray-900', className)}
      type="number"
      value={draftValue}
      onChange={(e) => setDraftValue(e.target.value)}
      onBlur={handleBlur}
      {...restProps}
    />
  );
}
