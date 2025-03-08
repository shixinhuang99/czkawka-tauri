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
    <form className={cn('grid gap-3 py-4', className)} {...restProps}>
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
    label?: React.ReactNode;
    comp: 'textarea' | 'input-number' | 'switch' | 'slider';
    suffix?: React.ReactNode;
  }>,
) {
  const { name, label, comp, suffix, children } = props;

  const { value, onChange } = useContext(FormContext);

  const slotProps = (() => {
    if (comp === 'switch') {
      return {
        name,
        checked: value[name],
        onCheckedChange: (v: boolean) => {
          onChange({ [name]: v });
        },
      };
    }
    if (comp === 'slider') {
      return {
        name,
        value: [value[name]],
        onValueChange: (values: number[]) => {
          onChange({ [name]: values[0] });
        },
      };
    }
    if (comp === 'input-number') {
      return {
        name,
        value: value[name],
        onChange: (e: React.FormEvent<HTMLInputElement>) => {
          onChange({ [name]: e.currentTarget.valueAsNumber });
        },
      };
    }
    return {
      name,
      value: value[name],
      onChange: (e: React.FormEvent<HTMLTextAreaElement>) => {
        onChange({ [name]: e.currentTarget.value });
      },
    };
  })();

  if (!label) {
    return (
      <Slot id={name} {...slotProps}>
        {children}
      </Slot>
    );
  }

  return (
    <div className="flex items-center gap-2 min-h-9">
      <Label className="flex-shrink-0" htmlFor={name}>
        {label}:
      </Label>
      <Slot id={name} {...slotProps}>
        {children}
      </Slot>
      {suffix}
    </div>
  );
}
FormItem.displayName = 'FormItem';
