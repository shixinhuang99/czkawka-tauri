import { useAtom } from 'jotai';
import { sidebarImagePreviewAtom } from '~/atom/primitive';

interface ClickableImagePreviewProps {
  path: string;
  children: React.ReactNode;
}

export function ClickableImagePreview(props: ClickableImagePreviewProps) {
  const { children, path } = props;
  const [, setSidebarState] = useAtom(sidebarImagePreviewAtom);

  const handleClick = () => {
    setSidebarState({
      isOpen: true,
      imagePath: path,
    });
  };

  return (
    <div 
      className="cursor-pointer hover:bg-accent/50 rounded px-1 py-0.5 transition-colors"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="点击预览图片"
    >
      {children}
    </div>
  );
}
