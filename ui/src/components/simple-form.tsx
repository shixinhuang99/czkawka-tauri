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

export function Form(props: FormProps) {
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
    <form className={cn('flex flex-col gap-3 py-4', className)} {...restProps}>
      <FormContext.Provider value={contextValue}>
        {children}
      </FormContext.Provider>
    </form>
  );
}

type CompType =
  | 'textarea'
  | 'input-number'
  | 'switch'
  | 'slider'
  | 'select'
  | 'checkbox';

export function FormItem(
  props: React.PropsWithChildren<{
    name: string;
    label?: React.ReactNode;
    description?: React.ReactNode;
    comp: CompType;
    suffix?: React.ReactNode;
  }>,
) {
  const { name, label, description, comp, suffix, children } = props;

  const { value, onChange } = useContext(FormContext);

  const slotProps: Record<string, any> = useMemo(() => {
    const compPropsMap: Record<CompType, Record<string, any>> = {
      textarea: {
        value: value[name],
        onChange: (e: React.FormEvent<HTMLTextAreaElement>) => {
          onChange({ [name]: e.currentTarget.value });
        },
      },
      'input-number': {
        value: value[name],
        onChange: (e: React.FormEvent<HTMLInputElement>) => {
          onChange({ [name]: e.currentTarget.valueAsNumber });
        },
      },
      switch: {
        checked: value[name],
        onCheckedChange: (v: boolean) => {
          onChange({ [name]: v });
        },
      },
      slider: {
        value: [value[name]],
        onValueChange: (values: number[]) => {
          onChange({ [name]: values[0] });
        },
      },
      select: {
        value: value[name],
        onChange: (v: string) => {
          onChange({ [name]: v });
        },
      },
      checkbox: {
        checked: value[name],
        onCheckedChange: (v: boolean | string) => {
          onChange({ [name]: !!v });
        },
      },
    };
    const compProps = compPropsMap[comp] || {};
    return { name, ...compProps };
  }, [value, name, comp, onChange]);

  if (!label) {
    return (
      <Slot id={name} {...slotProps}>
        {children}
      </Slot>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 min-h-9">
        <Label className="flex-shrink-0" htmlFor={name}>
          {label}:
        </Label>
        <Slot id={name} {...slotProps}>
          {children}
        </Slot>
        {suffix}
      </div>
      {description && (
        <div className="text-xs text-muted-foreground pl-2">{description}</div>
      )}
    </div>
  );
}
