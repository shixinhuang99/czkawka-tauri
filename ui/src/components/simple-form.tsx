import { Slot } from '@radix-ui/react-slot';
import { createContext, useContext, useMemo } from 'react';
import { cn } from '~/utils/cn';
import { Label } from './shadcn/label';

interface FormProps
  extends Omit<React.ComponentProps<'form'>, 'value' | 'onChange'> {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}

interface IFormContext {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}

const FormContext = createContext<IFormContext>({
  value: {},
  onChange: () => {},
});

export const Form = (props: FormProps) => {
  const { value, onChange, className, children, ...restProps } = props;

  const contextValue = useMemo(() => {
    return {
      value,
      onChange: (partialValue: Record<string, any>) => {
        onChange({ ...value, ...partialValue });
      },
    };
  }, [value, onChange]);

  return (
    <form className={cn('grid gap-4 py-4', className)} {...restProps}>
      <FormContext.Provider value={contextValue}>
        {children}
      </FormContext.Provider>
    </form>
  );
};
Form.displayName = 'Form';

export function FormItem(
  props: React.PropsWithChildren<{
    name: string;
    label?: string;
    comp: 'textarea' | 'input-number' | 'switch';
  }>,
) {
  const { name, label, comp, children } = props;

  const { value, onChange } = useContext(FormContext);

  const handleChange = (e: React.FormEvent<HTMLElement>) => {
    if (comp === 'textarea') {
      onChange({ [name]: (e.target as HTMLTextAreaElement).value });
    } else if (comp === 'input-number') {
      onChange({ [name]: (e.target as HTMLInputElement).valueAsNumber });
    }
  };

  const slotProps =
    comp === 'switch'
      ? {
          name,
          checked: value[name],
          onCheckedChange: (v: boolean) => {
            onChange({ [name]: v });
          },
        }
      : {
          name,
          value: value[name],
          onChange: handleChange,
        };

  if (!label) {
    return (
      <Slot id={name} {...slotProps}>
        {children}
      </Slot>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="flex-shrink-0" htmlFor={name}>
        {label}:
      </Label>
      <Slot id={name} {...slotProps}>
        {children}
      </Slot>
    </div>
  );
}
FormItem.displayName = 'FormItem';
