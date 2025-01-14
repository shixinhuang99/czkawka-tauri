import { CircleX } from 'lucide-react';
import { toast } from 'sonner';

function toastErrorImpl(msg: string, error?: string) {
  toast(msg, {
    icon: <CircleX className="text-red-500" />,
    className: 'gap-2',
    classNames: {
      title: 'text-red-500',
      icon: 'size-6 m-0',
    },
    description: error,
  });
}

export function toastError(msg: string, error: unknown) {
  if (typeof error === 'string') {
    toastErrorImpl(msg, error);
    return;
  }
  if (error instanceof Error) {
    toastErrorImpl(msg, error.message);
    return;
  }
  toastErrorImpl('Unknown error');
}
