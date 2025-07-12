import { X, ImageOff, LoaderCircle, Pin, PinOff, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { sidebarImagePreviewAtom } from '~/atom/primitive';
import { Button } from '~/components/shadcn/button';
import { useT } from '~/hooks';
import { ipc } from '~/ipc';
import { cn } from '~/utils/cn';
import { Resizable } from 're-resizable';

export function SidebarImagePreview() {
  const [sidebarState, setSidebarState] = useAtom(sidebarImagePreviewAtom);
  const { isOpen, imagePath, mode, position, size } = sidebarState;
  const t = useT();
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const closeSidebar = () => {
    setSidebarState(prev => ({ ...prev, isOpen: false, imagePath: null }));
  };

  const toggleMode = () => {
    const newMode = mode === 'fixed' ? 'floating' : 'fixed';
    setSidebarState(prev => ({ 
      ...prev, 
      mode: newMode,
      position: newMode === 'floating' ? { x: window.innerWidth - size.width - 20, y: 80 } : null
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'floating' || !dragRef.current) return;
    
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !position) return;
    
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - size.width));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 40));
    
    setSidebarState(prev => ({
      ...prev,
      position: { x: newX, y: newY }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (e: any, direction: any, ref: HTMLElement) => {
    setSidebarState(prev => ({
      ...prev,
      size: {
        width: ref.offsetWidth,
        height: ref.offsetHeight
      }
    }));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen || !imagePath) {
    return null;
  }

  const sidebarStyle = mode === 'fixed'
    ? {
        right: 0,
        top: 0,
        height: '100%',
        width: `${size.width}px`,
      }
    : {
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: size.width,
        height: size.height,
      };

  return (
    <Resizable
      size={size}
      onResizeStop={handleResize}
      enable={{
        top: mode === 'floating',
        right: true,
        bottom: mode === 'floating',
        left: mode === 'floating',
        topRight: mode === 'floating',
        bottomRight: true,
        bottomLeft: mode === 'floating',
        topLeft: mode === 'floating',
      }}
      minWidth={240}
      minHeight={mode === 'floating' ? 300 : '100%'}
      maxWidth={mode === 'floating' ? window.innerWidth - 40 : 600}
      maxHeight={mode === 'floating' ? window.innerHeight - 40 : '100%'}
      className={cn(
        'bg-background border border-border shadow-lg z-50',
        mode === 'fixed' ? 'fixed' : 'absolute',
        isDragging && 'cursor-grabbing'
      )}
      style={sidebarStyle}
    >
      <div className="flex flex-col h-full">
        {/* 标题栏 */}
        <div 
          ref={dragRef}
          className={cn(
            "flex items-center justify-between p-2 border-b border-border",
            mode === 'floating' && "cursor-grab"
          )}
          onMouseDown={handleMouseDown}
        >
          <h3 className="font-semibold text-sm truncate" title={imagePath}>
            {t('Image preview')}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              className="h-6 w-6 p-0"
              title={mode === 'fixed' ? t('Switch to floating mode') : t('Switch to fixed mode')}
            >
              {mode === 'fixed' ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 文件路径 */}
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
          <div className="break-all">{imagePath}</div>
        </div>

        {/* 图片预览区域 */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="h-full flex flex-col">
            <ImageContent path={imagePath} />
          </div>
        </div>
      </div>
    </Resizable>
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
