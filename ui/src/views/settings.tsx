import { openPath } from '@tauri-apps/plugin-opener';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  CircleHelpIcon,
  ClockIcon,
  FilesIcon,
  ImageIcon,
  MusicIcon,
  PaletteIcon,
  SearchIcon,
  SettingsIcon,
  VideoIcon,
} from 'lucide-react';
import { useState } from 'react';
import { initCurrentPresetAtom } from '~/atom/preset';
import { platformSettingsAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  Button,
  InputNumber,
  Label,
  ScrollArea,
  Slider,
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
import { MAXIMUM_FILE_SIZE } from '~/consts';
import { useOnceEffect, useT } from '~/hooks';
import { eventPreventDefault } from '~/utils/event';
import { PresetSelect } from './preset-select';

const SettingsTab = {
  Appearance: 'appearance',
  Scanner: 'scanner',
} as const;

export function SettingsButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preventDialogClose, setPreventDialogClose] = useState(false);
  const [tabValue, setTabValue] = useState<string>(SettingsTab.Scanner);
  const initCurrentPreset = useSetAtom(initCurrentPresetAtom);
  const t = useT();

  useOnceEffect(() => {
    initCurrentPreset();
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
      <DialogContent className="max-w-[700px] outline-none">
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
      <PresetSelect onPreventDialogCloseChange={onPreventDialogCloseChange} />
      <ScrollArea className="flex-1 mt-2">
        <Form className="pr-3" value={settings} onChange={handleSettingsChange}>
          <SectionHeader icon={SettingsIcon}>{t('general')}</SectionHeader>
          <SectionContent>
            <FormItem
              name="excludedItems"
              label={t('excludedItems')}
              comp="textarea"
            >
              <Textarea rows={2} className="w-[60%]" />
            </FormItem>
            <FormItem
              name="allowedExtensions"
              label={t('allowedExtensions')}
              comp="textarea"
            >
              <Textarea rows={2} className="w-[60%]" />
            </FormItem>
            <FormItem
              name="excludedExtensions"
              label={t('excludedExtensions')}
              comp="textarea"
            >
              <Textarea rows={2} className="w-[60%]" />
            </FormItem>
            <RawFormItem>
              <Label className="flex-shrink-0">{t('fileSize')}(KB):</Label>
              <div className="w-[60%] flex items-center gap-2">
                <FormItem name="minimumFileSize" comp="input-number">
                  <InputNumber minValue={16} maxValue={MAXIMUM_FILE_SIZE} />
                </FormItem>
                ~
                <FormItem name="maximumFileSize" comp="input-number">
                  <InputNumber minValue={16} maxValue={MAXIMUM_FILE_SIZE} />
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
                  <TooltipButton
                    tooltip={t('threadNumberTip')}
                    onClick={eventPreventDefault}
                    className="cursor-default"
                  >
                    <CircleHelpIcon />
                  </TooltipButton>
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
                    <span>
                      {settings.threadNumber}/
                      {platformSettings.availableThreadNumber}
                    </span>
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
              <InputNumber minValue={1} className="w-[40%]" />
            </FormItem>
            <FormItem
              name="duplicateMinimalPrehashCacheSize"
              label={`${t('minimalSizeOfCachedFiles')} - ${t('prehash')} (KB)`}
              comp="input-number"
            >
              <InputNumber minValue={1} className="w-[40%]" />
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
          <SectionHeader icon={ClockIcon}>{t('other')}</SectionHeader>
          <SectionContent>
            <Button variant="secondary" onClick={handleOpenCacheFolder}>
              {t('openCacheFolder')}
            </Button>
          </SectionContent>
        </Form>
      </ScrollArea>
    </>
  );
}

function SectionContent({ children }: React.PropsWithChildren) {
  return (
    <div className="border border-border rounded-lg p-4 divide-y divide-border [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0 bg-neutral-50 dark:bg-gray-900">
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
