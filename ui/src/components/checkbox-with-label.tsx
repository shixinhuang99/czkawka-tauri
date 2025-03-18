import type { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from './shadcn/checkbox';
import { Label } from './shadcn/label';

interface CheckboxWithLabelPorps {
  id?: string;
  name?: string;
  checked?: boolean;
  onCheckedChange?: (v: CheckedState) => void;
  label: string;
}

export function CheckboxWithLabel(props: CheckboxWithLabelPorps) {
  const { id, name, checked, onCheckedChange, label } = props;

  return (
    <div className="inline-flex items-center gap-2">
      <Checkbox
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label>{label}</Label>
    </div>
  );
}
