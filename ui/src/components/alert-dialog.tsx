import { LoaderCircleIcon } from 'lucide-react';
import { useT } from '~/hooks';
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog as AlertDialogPrimitive,
  AlertDialogTitle,
} from './shadcn/alert-dialog';
import { Button } from './shadcn/button';

interface AlertDialogProps {
  title: string;
  description: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOk: () => void;
  okLoading: boolean;
}

export function AlertDialog({
  children,
  title,
  description,
  open,
  onOpenChange,
  onOk,
  okLoading,
}: React.PropsWithChildren<AlertDialogProps>) {
  const t = useT();

  return (
    <AlertDialogPrimitive open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={okLoading}>
            {t('cancel')}
          </AlertDialogCancel>
          <Button onClick={onOk} disabled={okLoading}>
            {okLoading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              t('ok')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
}
