import { openPath, openUrl } from '@tauri-apps/plugin-opener';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ExternalLinkIcon,
  FilesIcon,
  FolderOpenIcon,
  ImageIcon,
  MoonIcon,
  MusicIcon,
  PaletteIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  TvMinimalIcon,
  VideoIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguageAtom } from '~/atom/language';
import { initCurrentPresetAtom } from '~/atom/preset';
import {
  languageAtom,
  platformSettingsAtom,
  themeAtom,
} from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { applyMatchMediaAtom, initThemeAtom, setThemeAtom } from '~/atom/theme';
import {
  Button,
  HoverTip,
  InputNumber,
  ScrollArea,
  Select,
  Slider,
  SliderValue,
  Switch,
  Textarea,
  TooltipButton,
  toastError,
} from '~/components';
import { Form, FormItem, RawFormItem } from '~/components/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/shadcn/dialog';
import { Tabs, TabsList, TabsTrigger } from '~/components/shadcn/tabs';
import { DARK_MODE_MEDIA, Languages, MAXIMUM_FILE_SIZE, Theme } from '~/consts';
import { useOnceEffect, useT } from '~/hooks';
import { cn } from '~/utils/cn';
import { PresetSelect } from './preset-select';

const SettingsTab = {
  Appearance: 'appearance',
  Scanner: 'scanner',
} as const;

export function SettingsButton() {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preventDialogClose, setPreventDialogClose] = useState(false);
  const [tabValue, setTabValue] = useState<string>(SettingsTab.Appearance);
  const initCurrentPreset = useSetAtom(initCurrentPresetAtom);
  const initTheme = useSetAtom(initThemeAtom);
  const applyMatchMedia = useSetAtom(applyMatchMediaAtom);

  useOnceEffect(() => {
    initCurrentPreset();
    initTheme();
    const mql = window.matchMedia(DARK_MODE_MEDIA);
    applyMatchMedia(mql.matches);
    mql.addEventListener('change', (e) => {
      applyMatchMedia(e.matches);
    });
  });

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (preventDialogClose) {
          return;
        }
        setDialogOpen(open);
      }}
      checkOpenedSelect={false}
    >
      <DialogTrigger asChild>
        <TooltipButton tooltip={t('settings')}>
          <SettingsIcon />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] outline-none">
        <DialogHeader>
          <DialogTitle>{t('settings')}</DialogTitle>
          <DialogDescription>{t('applicationSettings')}</DialogDescription>
        </DialogHeader>
        <div className="h-[550px] flex flex-col">
          <Tabs className="mb-2" value={tabValue} onValueChange={setTabValue}>
            <TabsList className="w-full">
              <TabsTrigger className="w-full" value={SettingsTab.Appearance}>
                <PaletteIcon />
                <span className="ml-2">{t('appearance')}</span>
              </TabsTrigger>
              <TabsTrigger className="w-full" value={SettingsTab.Scanner}>
                <SearchIcon />
                <span className="ml-2">{t('scanner')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {tabValue === SettingsTab.Appearance && <AppearancesSettings />}
          {tabValue === SettingsTab.Scanner && (
            <ScanerSettings
              onPreventDialogCloseChange={setPreventDialogClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AppearancesSettings() {
  const t = useT();
  const { i18n } = useTranslation();
  const language = useAtomValue(languageAtom);
  const setLanguage = useSetAtom(setLanguageAtom);
  const theme = useAtomValue(themeAtom);
  const setTheme = useSetAtom(setThemeAtom);
  const platformSettings = useAtomValue(platformSettingsAtom);

  const handleLanguageChange = (v: string) => {
    setLanguage(v);
    i18n.changeLanguage(v);
  };

  const handleOpenCacheFolder = () => {
    if (!platformSettings.cacheDirPath) {
      return;
    }
    openPath(platformSettings.cacheDirPath).catch((err) => {
      toastError(t('failedToOpenCacheFolder'), err);
    });
  };

  return (
    <>
      <SectionContent>
        <RawFormItem label={t('language')}>
          <Select
            className="w-[60%] dark:bg-background"
            value={language}
            onValueChange={handleLanguageChange}
            options={[
              { label: 'English', value: Languages.En },
              { label: '简体中文', value: Languages.Zh },
            ]}
          />
        </RawFormItem>
        <RawFormItem label={t('theme')}>
          <Tabs className="w-[60%]" value={theme} onValueChange={setTheme}>
            <TabsList className="w-full">
              <TabsTrigger className="w-full" value={Theme.Light}>
                <SunIcon className="size-4 mr-1" />
                {t('light')}
              </TabsTrigger>
              <TabsTrigger className="w-full" value={Theme.Dark}>
                <MoonIcon className="size-4 mr-1" />
                {t('dark')}
              </TabsTrigger>
              <TabsTrigger className="w-full" value={Theme.System}>
                <TvMinimalIcon className="size-4 mr-1" />
                {t('system')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </RawFormItem>
      </SectionContent>
      <SectionContent className="mt-4 [&>div]:text-center">
        <div className="text-muted-foreground">
          {t('version')}: {PKG_VERSION}
        </div>
        <div>
          <Button
            variant="link"
            onClick={() => openUrl(REPOSITORY_URL)}
            title={REPOSITORY_URL}
          >
            {t('viewSourceCode')}
            <ExternalLinkIcon />
          </Button>
        </div>
        <div>
          <Button variant="link" onClick={handleOpenCacheFolder}>
            {t('openCacheFolder')}
            <FolderOpenIcon />
          </Button>
        </div>
      </SectionContent>
    </>
  );
}

interface ScannerSettingsProps {
  onPreventDialogCloseChange: (open: boolean) => void;
}

function ScanerSettings({ onPreventDialogCloseChange }: ScannerSettingsProps) {
  const [settings, setSettings] = useAtom(settingsAtom);
  const platformSettings = useAtomValue(platformSettingsAtom);
  const t = useT();

  const handleSettingsChange = (v: Record<string, any>) => {
    setSettings((prev) => ({ ...prev, ...v }));
  };

  return (
    <>
      <PresetSelect onPreventDialogCloseChange={onPreventDialogCloseChange} />
      <ScrollArea className="flex-1">
        <Form className="pr-3" value={settings} onChange={handleSettingsChange}>
          <SectionHeader icon={SettingsIcon}>{t('general')}</SectionHeader>
          <SectionContent>
            <FormItem
              name="excludedItems"
              label={t('excludedItems')}
              comp="textarea"
            >
              <Textarea rows={2} className="w-[60%] dark:bg-background" />
            </FormItem>
            <FormItem
              name="allowedExtensions"
              label={t('allowedExtensions')}
              comp="textarea"
            >
              <Textarea rows={2} className="w-[60%] dark:bg-background" />
            </FormItem>
            <FormItem
              name="excludedExtensions"
              label={t('excludedExtensions')}
              comp="textarea"
            >
              <Textarea rows={2} className="w-[60%] dark:bg-background" />
            </FormItem>
            <RawFormItem label={<>{t('fileSize')}(KB)</>}>
              <div className="w-[60%] flex items-center gap-2">
                <FormItem name="minimumFileSize" comp="input-number">
                  <InputNumber
                    minValue={16}
                    maxValue={MAXIMUM_FILE_SIZE}
                    className="dark:bg-background"
                  />
                </FormItem>
                ~
                <FormItem name="maximumFileSize" comp="input-number">
                  <InputNumber
                    minValue={16}
                    maxValue={MAXIMUM_FILE_SIZE}
                    className="dark:bg-background"
                  />
                </FormItem>
              </div>
            </RawFormItem>
            <FormItem
              name="recursiveSearch"
              label={t('recursiveSearch')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem name="useCache" label={t('useCache')} comp="switch">
              <Switch />
            </FormItem>
            <FormItem
              name="saveAlsoAsJson"
              label={t('alsoSaveCacheAsJsonFile')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="moveDeletedFilesToTrash"
              label={t('moveDeletedFilesToTrash')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="threadNumber"
              label={
                <span className="inline-flex items-center">
                  {t('threadNumber')}
                  <HoverTip text={t('threadNumberTip')} className="mx-1" />
                </span>
              }
              comp="slider"
            >
              {(slotProps) => {
                return (
                  <div className="w-[60%] flex items-center gap-2">
                    <Slider
                      min={1}
                      max={platformSettings.availableThreadNumber}
                      id={slotProps.name}
                      {...slotProps}
                    />
                    <SliderValue
                      value={settings.threadNumber}
                      max={platformSettings.availableThreadNumber}
                    />
                  </div>
                );
              }}
            </FormItem>
          </SectionContent>
          <SectionHeader icon={FilesIcon}>{t('duplicateFiles')}</SectionHeader>
          <SectionContent>
            <FormItem
              name="duplicateMinimalHashCacheSize"
              label={`${t('minimalSizeOfCachedFiles')} - ${t('hash')} (KB)`}
              comp="input-number"
            >
              <InputNumber
                minValue={1}
                className="w-[40%] dark:bg-background"
              />
            </FormItem>
            <FormItem
              name="duplicateMinimalPrehashCacheSize"
              label={`${t('minimalSizeOfCachedFiles')} - ${t('prehash')} (KB)`}
              comp="input-number"
            >
              <InputNumber
                minValue={1}
                className="w-[40%] dark:bg-background"
              />
            </FormItem>
            <FormItem
              name="duplicateImagePreview"
              label={t('imagePreview')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="duplicateHideHardLinks"
              label={t('hideHardLinks')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="duplicateUsePrehash"
              label={t('usePrehash')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="duplicateDeleteOutdatedEntries"
              label={t('deleteAutomaticallyOutdatedEntries')}
              comp="switch"
            >
              <Switch />
            </FormItem>
          </SectionContent>
          <SectionHeader icon={ImageIcon}>{t('similarImages')}</SectionHeader>
          <SectionContent>
            <FormItem
              name="similarImagesShowImagePreview"
              label={t('imagePreview')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="similarImagesHideHardLinks"
              label={t('hideHardLinks')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="similarImagesDeleteOutdatedEntries"
              label={t('deleteAutomaticallyOutdatedEntries')}
              comp="switch"
            >
              <Switch />
            </FormItem>
          </SectionContent>
          <SectionHeader icon={VideoIcon}>{t('similarVideos')}</SectionHeader>
          <SectionContent>
            <FormItem
              name="similarVideosHideHardLinks"
              label={t('hideHardLinks')}
              comp="switch"
            >
              <Switch />
            </FormItem>
            <FormItem
              name="similarVideosDeleteOutdatedEntries"
              label={t('deleteAutomaticallyOutdatedEntries')}
              comp="switch"
            >
              <Switch />
            </FormItem>
          </SectionContent>
          <SectionHeader icon={MusicIcon}>{t('musicDuplicates')}</SectionHeader>
          <SectionContent>
            <FormItem
              name="similarMusicDeleteOutdatedEntries"
              label={t('deleteAutomaticallyOutdatedEntries')}
              comp="switch"
            >
              <Switch />
            </FormItem>
          </SectionContent>
        </Form>
      </ScrollArea>
    </>
  );
}

function SectionContent({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'border border-border rounded-lg p-4 divide-y divide-border [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0 bg-neutral-50 dark:bg-gray-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
}

function SectionHeader({
  icon: Icon,
  children,
}: React.PropsWithChildren<SectionHeaderProps>) {
  return (
    <div className="flex items-center w-full my-6">
      <div className="flex-grow border-t border-border" />
      <div className="flex items-center gap-2 px-4">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {children}
        </h3>
      </div>
      <div className="flex-grow border-t border-border" />
    </div>
  );
}
