import { ImageOff, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '~/components/shadcn/hover-card';
import { useT } from '~/hooks';
import { ipc } from '~/ipc';

interface ImgPreviewProps {
  path: string;
}

export function ImagePreview(props: React.PropsWithChildren<ImgPreviewProps>) {
  const { children, path } = props;

  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="p-0 h-[450px] w-[500px]" side="right">
        <Image path={path} />
      </HoverCardContent>
    </HoverCard>
  );
}

function Image(props: { path: string }) {
  const { path } = props;

  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useT();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const readImage = async () => {
      try {
        const { mimeType, base64 } = await ipc.readImage(path);
        setSrc(`data:${mimeType};base64,${base64}`);
      } catch (_) {
        //
      } finally {
        setLoading(false);
      }
    };
    readImage();
  }, []);

  if (src) {
    return (
      <img className="h-full w-full object-contain" src={src} alt={path} />
    );
  }

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <LoaderCircle className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <ImageOff className="size-24" />
      {t('Failed to read image')}
    </div>
  );
}
