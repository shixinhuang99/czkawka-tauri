import { openUrl } from '@tauri-apps/plugin-opener';
import { LanguagesIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, TooltipButton } from '~/components';
import { GitHub } from '~/components/icons';
import { SelectIconTrigger } from '~/components/select';
import { useT } from '~/hooks';
import { storage } from '~/utils/storage';
import { SettingsButton } from './settings';

export function AppHeader() {
  return (
    <div
      className="w-full h-11 flex justify-end items-center px-4 py-1 border-b border-border/50 dark:border-border"
      data-tauri-drag-region={PLATFORM === 'darwin' ? true : undefined}
    >
      <div className="flex items-center gap-1.5">
        <ChangeLanguageButton />
        <SettingsButton />
        <ViewGitHubButton />
      </div>
    </div>
  );
}

function ViewGitHubButton() {
  const t = useT();

  return (
    <TooltipButton
      tooltip={t('viewSourceCode')}
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
          <LanguagesIcon />
        </SelectIconTrigger>
      }
      value={value}
      onValueChange={handleLanguageChange}
      options={[
        { label: 'English', value: 'en' },
        { label: '简体中文', value: 'zh' },
      ]}
    />
  );
}
