import { useAtom, useSetAtom } from 'jotai';
import { useDebouncedCallback } from 'use-debounce';
import { searchInputValueAtom } from '~/atom/primitive';
import { currentToolFilterAtom } from '~/atom/tools';
import { SearchInput } from '~/components';
import { useT } from '~/hooks';
import { SettingsButton } from './settings';

export function AppHeader() {
  const setFilter = useSetAtom(currentToolFilterAtom);
  const [inputValue, setInputValue] = useAtom(searchInputValueAtom);
  const debouncedSetFilter = useDebouncedCallback(setFilter, 300);
  const t = useT();

  const handleInputChange = (v: string) => {
    setInputValue(v);
    debouncedSetFilter(v.trim());
  };

  return (
    <div
      className="w-full h-11 flex justify-between items-center px-4 py-1 border-b border-border/50 dark:border-border"
      data-tauri-drag-region={PLATFORM === 'darwin' ? true : undefined}
    >
      <div className="flex items-center gap-2 w-[70%]">
        <SearchInput
          placeholder={`${t('search')}...`}
          value={inputValue}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
      <SettingsButton />
    </div>
  );
}
