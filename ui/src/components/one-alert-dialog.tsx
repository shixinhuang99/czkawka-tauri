import { LoaderCircle } from 'lucide-react';
import { useT } from '~/hooks';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './shadcn/alert-dialog';
import { Button } from './shadcn/button';

interface OneAlertDialogProps {
  title: string;
  description: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOk: () => void;
  okLoading: boolean;
}

export function OneAlertDialog(
  props: React.PropsWithChildren<OneAlertDialogProps>,
) {
  const { children, title, description, open, onOpenChange, onOk, okLoading } =
    props;

  const t = useT();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={okLoading}>
            {t('Cancel')}
          </AlertDialogCancel>
          <Button onClick={onOk} disabled={okLoading}>
            {okLoading ? <LoaderCircle className="animate-spin" /> : t('Ok')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
