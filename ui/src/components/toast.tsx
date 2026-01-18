import { CircleXIcon } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '~/i18n';

function toastErrorImpl(msg: string, error?: string) {
  toast(msg, {
    icon: <CircleXIcon className="text-red-500" />,
    className: 'gap-2',
    classNames: {
      title: 'text-red-500',
      icon: 'size-6 m-0',
    },
    description: error,
  });
}

export function toastError(msg: string, error: unknown) {
  console.error(error);
  if (typeof error === 'string') {
    toastErrorImpl(msg, error);
    return;
  }
  if (error instanceof Error) {
    toastErrorImpl(msg, error.message);
    return;
  }
  toastErrorImpl(t('unknownError'));
}
