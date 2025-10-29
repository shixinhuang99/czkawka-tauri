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

interface SlotProps {
  name: string;
  [key: string]: any;
}

interface FormItemProps {
  name: string;
  label?: React.ReactNode;
  comp: CompType;
  className?: string;
  children: React.ReactNode | ((props: SlotProps) => React.ReactNode);
}

export function FormItem(props: FormItemProps) {
  const { name, label, comp, children, className } = props;

  const { value, onChange } = useContext(FormContext);

  const slotProps: SlotProps = useMemo(() => {
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

  const content =
    typeof children === 'function' ? (
      children(slotProps)
    ) : (
      <Slot id={name} {...slotProps}>
        {children}
      </Slot>
    );

  if (!label) {
    return content;
  }

  return (
    <RawFormItem className={className}>
      <Label className="flex-shrink-0" htmlFor={name}>
        {label}:
      </Label>
      {content}
    </RawFormItem>
  );
}

export function RawFormItem({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 min-h-9 justify-between',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
