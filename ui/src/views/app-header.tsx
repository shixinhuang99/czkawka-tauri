import { SettingsButton } from './settings';

export function AppHeader() {
  return (
    <div
      className="w-full h-11 flex justify-end items-center px-4 py-1 border-b border-border/50 dark:border-border"
      data-tauri-drag-region={PLATFORM === 'darwin' ? true : undefined}
    >
      <div className="flex items-center gap-1.5">
        <SettingsButton />
      </div>
    </div>
  );
}
