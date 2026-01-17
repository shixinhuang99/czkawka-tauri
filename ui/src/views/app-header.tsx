import { useAtom, useAtomValue } from 'jotai';
import { useDebouncedCallback } from 'use-debounce';
import { searchInputValueAtom } from '~/atom/primitive';
import {
  currentFilterAtom,
  foundCountAtom,
  selectedCountAtom,
  totalCountAtom,
} from '~/atom/table';
import { SearchInput } from '~/components';
import { useT } from '~/hooks';
import { getDataTauriDragRegionProp } from '~/styles';
import { cn } from '~/utils/cn';
import { SettingsButton } from './settings';

export function AppHeader() {
  const t = useT();
  const [filter, setFilter] = useAtom(currentFilterAtom);
  const debouncedSetFilter = useDebouncedCallback(setFilter, 300);
  const [inputValue, setInputValue] = useAtom(searchInputValueAtom);
  const totalCount = useAtomValue(totalCountAtom);
  const selectedCount = useAtomValue(selectedCountAtom);
  const foundCount = useAtomValue(foundCountAtom);

  const handleInputChange = (v: string) => {
    setInputValue(v);
    debouncedSetFilter(v.trim());
  };

  return (
    <div
      className="w-full h-11 flex justify-between items-center gap-4 px-4 py-1 border-b"
      {...getDataTauriDragRegionProp()}
    >
      <div className="flex-1 flex gap-4 max-w-[85%]">
        <SearchInput
          placeholder={`${t('search')}...`}
          value={inputValue}
          onChange={handleInputChange}
          className="w-full"
        />
        <div className="flex items-center gap-2 text-xs whitespace-nowrap">
          <CountItem
            label={t('total')}
            count={totalCount}
            className="text-blue-600 dark:text-blue-400"
          />
          <CountItem
            label={t('selected')}
            count={selectedCount}
            className="text-green-600 dark:text-green-400"
          />
          <CountItem
            label={t('found')}
            count={filter ? foundCount : '--'}
            className="text-orange-600 dark:text-orange-400"
          />
        </div>
      </div>
      <SettingsButton />
    </div>
  );
}

interface CountItemProps {
  label: string;
  count: number | string;
  className?: string;
}

function CountItem({ label, count, className }: CountItemProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn('font-semibold', className)}>{count}</span>
    </div>
  );
}
