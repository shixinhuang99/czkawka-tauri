import type { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Checkbox } from './shadcn/checkbox';
import { Label } from './shadcn/label';

interface CheckboxWithLabelPorps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  label: string;
}

export function CheckboxWithLabel({ label, ...props }: CheckboxWithLabelPorps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Checkbox {...props} />
      <Label>{label}</Label>
    </div>
  );
}
