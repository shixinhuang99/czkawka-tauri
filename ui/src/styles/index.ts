export * from './variants';

export function scrollBarClassNames() {
  return 'scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 dark:hover:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full';
}

export function getDataTauriDragRegionProp() {
  return { 'data-tauri-drag-region': PLATFORM === 'macOS' ? true : undefined };
}
