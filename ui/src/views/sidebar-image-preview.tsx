import { X, ImageOff, LoaderCircle, Pin, PinOff } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { sidebarImagePreviewAtom } from '~/atom/primitive';
import { Button } from '~/components/shadcn/button';
import { useT } from '~/hooks';
import { ipc } from '~/ipc';
import { cn } from '~/utils/cn';

export function SidebarImagePreview() {
  const [sidebarState, setSidebarState] = useAtom(sidebarImagePreviewAtom);
  const { isOpen, imagePath, mode, position, size } = sidebarState;
  const t = useT();
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  const closeSidebar = () => {
    setSidebarState(prev => ({ ...prev, isOpen: false, imagePath: null }));
  };

  const toggleMode = () => {
    const newMode = mode === 'fixed' ? 'floating' : 'fixed';
    setSidebarState(prev => ({ 
      ...prev, 
      mode: newMode,
      position: newMode === 'floating' 
        ? { 
            x: Math.max(0, Math.min(window.innerWidth / 2 - size.width / 2, window.innerWidth - size.width - 20)), 
            y: 100 
          } 
        : null
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
    if (isDragging && !isResizing && position) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - size.width));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 40));
      
      setSidebarState(prev => ({
        ...prev,
        position: { x: newX, y: newY }
      }));
    } else if (isResizing && resizeDirection && position) {
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newX = position.x;
      let newY = position.y;
      
      // Handle different resize directions
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(200, resizeStartSize.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        const widthChange = Math.min(resizeStartSize.width - 200, deltaX);
        newWidth = Math.max(200, resizeStartSize.width - deltaX);
        newX = resizeStartPos.x + widthChange;
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(150, resizeStartSize.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        const heightChange = Math.min(resizeStartSize.height - 150, deltaY);
        newHeight = Math.max(150, resizeStartSize.height - deltaY);
        newY = resizeStartPos.y + heightChange;
      }
      
      // Ensure the preview stays within viewport bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight));
      
      setSidebarState(prev => ({
        ...prev,
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const startResize = (e: React.MouseEvent, direction: string) => {
    if (mode !== 'floating') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: size.width, height: size.height });
    
    if (position) {
      setResizeStartPos({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeDirection, resizeStartPos, resizeStartSize]);

  if (!isOpen || !imagePath) {
    return null;
  }

  // 计算预览窗口的位置和大小
  const previewStyle = mode === 'fixed'
    ? {
        right: 20,
        top: 80,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }
    : {
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: `${size.width}px`,
        height: `${size.height}px`,
      };

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      <div 
        className={cn(
          'pointer-events-auto fixed bg-background border border-border shadow-lg rounded-md overflow-hidden',
          isDragging && 'cursor-grabbing',
          isResizing && 'select-none'
        )}
        style={previewStyle}
      >
        {/* Resize handles - only show in floating mode */}
        {mode === 'floating' && (
          <>
            <div 
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10" 
              onMouseDown={(e) => startResize(e, 'nw')}
            />
            <div 
              className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-10" 
              onMouseDown={(e) => startResize(e, 'ne')}
            />
            <div 
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-10" 
              onMouseDown={(e) => startResize(e, 'sw')}
            />
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10" 
              onMouseDown={(e) => startResize(e, 'se')}
            />
            <div 
              className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-10" 
              onMouseDown={(e) => startResize(e, 'n')}
            />
            <div 
              className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-10" 
              onMouseDown={(e) => startResize(e, 's')}
            />
            <div 
              className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-10" 
              onMouseDown={(e) => startResize(e, 'w')}
            />
            <div 
              className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-10" 
              onMouseDown={(e) => startResize(e, 'e')}
            />
          </>
        )}

        <div className="flex flex-col h-full">
          {/* 标题栏 */}
          <div 
            ref={dragRef}
            className={cn(
              "flex items-center justify-between p-2 border-b border-border bg-muted/30",
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
          <div className="text-sm text-muted-foreground">{t('Loading...')}</div>
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
          <div className="text-muted-foreground">{t('Format')}:</div>
          <div className="truncate">
            {path.split('.').pop()?.toUpperCase() || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}
