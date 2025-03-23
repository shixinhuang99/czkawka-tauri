import { openUrl } from '@tauri-apps/plugin-opener';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, TooltipButton } from '~/components';
import { GitHub } from '~/components/icons';
import { SelectIconTrigger } from '~/components/one-select';
import { useT } from '~/hooks';
import { storage } from '~/utils/storage';
import { SettingsButton } from './settings';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <div
      className="w-full h-11 flex justify-end items-center px-4 py-1 border-b border-border/50 dark:border-border"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-1.5">
        <ChangeLanguageButton />
        <SettingsButton />
        <ThemeToggle />
        <ViewGitHubButton />
      </div>
    </div>
  );
}

function ViewGitHubButton() {
  const t = useT();

  return (
    <TooltipButton
      tooltip={t('View source code')}
      onClick={() => openUrl(REPOSITORY_URL)}
    >
      <GitHub />
    </TooltipButton>
  );
}

function ChangeLanguageButton() {
  const { i18n } = useTranslation();
  const [value, setValue] = useState(i18n.language);

  const handleLanguageChange = (v: string) => {
    setValue(v);
    i18n.changeLanguage(v);
    storage.setLanguage(v);
    document.documentElement.lang = v;
  };

  return (
    <Select
      trigger={
        <SelectIconTrigger>
          <Languages />
        </SelectIconTrigger>
      }
      value={value}
      onChange={handleLanguageChange}
      options={[
        { label: 'English', value: 'en' },
        { label: '简体中文', value: 'zh' },
      ]}
    />
  );
}
