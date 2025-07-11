import { X, ImageOff, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { sidebarImagePreviewAtom } from '~/atom/primitive';
import { Button } from '~/components/shadcn/button';
import { useT } from '~/hooks';
import { ipc } from '~/ipc';
import { cn } from '~/utils/cn';

export function SidebarImagePreview() {
  const [sidebarState, setSidebarState] = useAtom(sidebarImagePreviewAtom);
  const { isOpen, imagePath } = sidebarState;
  const t = useT();

  const closeSidebar = () => {
    setSidebarState({ isOpen: false, imagePath: null });
  };

  if (!isOpen || !imagePath) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 shadow-lg transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-sm truncate" title={imagePath}>
            {t('Image preview')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 文件路径 */}
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
          <div className="break-all">{imagePath}</div>
        </div>

        {/* 图片预览区域 */}
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            <ImageContent path={imagePath} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageContent({ path }: { path: string }) {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const t = useT();

  useEffect(() => {
    setLoading(true);
    setError(false);
    setSrc('');

    const readImage = async () => {
      try {
        const { mimeType, base64 } = await ipc.readImage(path);
        setSrc(`data:${mimeType};base64,${base64}`);
      } catch (err) {
        console.error('Failed to read image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    readImage();
  }, [path]);

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <LoaderCircle className="animate-spin size-8" />
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !src) {
    return (
      <div className="h-full flex flex-col justify-center items-center gap-2">
        <ImageOff className="size-16 text-muted-foreground" />
        <div className="text-sm text-muted-foreground text-center">
          {t('Failed to read image')}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 图片显示区域 */}
      <div className="flex-1 flex justify-center items-center bg-muted/30 rounded-lg overflow-hidden">
        <img
          className="max-h-full max-w-full object-contain"
          src={src}
          alt={path}
          onError={() => setError(true)}
        />
      </div>

      {/* 图片信息 */}
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-muted-foreground">格式:</div>
          <div className="truncate">
            {path.split('.').pop()?.toUpperCase() || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}
