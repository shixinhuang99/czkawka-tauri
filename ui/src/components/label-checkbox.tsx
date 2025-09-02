import { Checkbox } from './shadcn/checkbox';
import { Label } from './shadcn/label';

interface LabelCheckboxPorps
  extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  label: string;
}

export function LabelCheckbox({ label, ...props }: LabelCheckboxPorps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Checkbox {...props} />
      <Label>{label}</Label>
    </div>
  );
}
