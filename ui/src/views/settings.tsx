import { openPath } from '@tauri-apps/plugin-opener';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { CircleHelpIcon, SettingsIcon } from 'lucide-react';
import { useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/shadcn/dialog';
import { Form, FormItem } from '~/components/simple-form';
import { MAXIMUM_FILE_SIZE } from '~/consts';
import { useBoolean, useT } from '~/hooks';
import { eventPreventDefault } from '~/utils/event';
import { PresetSelect } from './preset-select';

export function SettingsButton() {
  const dialogOpen = useBoolean();
  const isPreventDialogClose = useBoolean();
  const initCurrentPreset = useSetAtom(initCurrentPresetAtom);
  const t = useT();

  useEffect(() => {
    initCurrentPreset();
  }, []);

  return (
    <Dialog
      open={dialogOpen.value}
      onOpenChange={(open) => {
        if (isPreventDialogClose.value) {
          return;
        }
        dialogOpen.set(open);
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
          <PresetSelect onPreventDialogCloseChange={isPreventDialogClose.set} />
          <SettingsContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsContent() {
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
    <ScrollArea className="flex-1">
      <Form className="pr-3" value={settings} onChange={handleSettingsChange}>
        <GroupTitle>{t('generalSettings')}</GroupTitle>
        <FormItem
          name="excludedItems"
          label={t('excludedItems')}
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <FormItem
          name="allowedExtensions"
          label={t('allowedExtensions')}
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <FormItem
          name="excludedExtensions"
          label={t('excludedExtensions')}
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <div className="flex items-center gap-2">
          <Label className="flex-shrink-0">{t('fileSize')}(KB):</Label>
          <FormItem name="minimumFileSize" comp="input-number">
            <InputNumber minValue={16} maxValue={MAXIMUM_FILE_SIZE} />
          </FormItem>
          ~
          <FormItem name="maximumFileSize" comp="input-number">
            <InputNumber minValue={16} maxValue={MAXIMUM_FILE_SIZE} />
          </FormItem>
        </div>
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
              >
                <CircleHelpIcon />
              </TooltipButton>
            </span>
          }
          comp="slider"
          suffix={
            <span>
              {settings.threadNumber}/{platformSettings.availableThreadNumber}
            </span>
          }
        >
          <Slider min={1} max={platformSettings.availableThreadNumber} />
        </FormItem>
        <GroupTitle>{t('duplicateFiles')}</GroupTitle>
        <FormItem
          name="duplicateMinimalHashCacheSize"
          label={`${t('minimalSizeOfCachedFiles')} - ${t('hash')} (KB)`}
          comp="input-number"
        >
          <InputNumber minValue={1} />
        </FormItem>
        <FormItem
          name="duplicateMinimalPrehashCacheSize"
          label={`${t('minimalSizeOfCachedFiles')} - ${t('prehash')} (KB)`}
          comp="input-number"
        >
          <InputNumber minValue={1} />
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
        <GroupTitle>{t('similarImages')}</GroupTitle>
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
        <GroupTitle>{t('similarVideos')}</GroupTitle>
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
        <GroupTitle>{t('musicDuplicates')}</GroupTitle>
        <FormItem
          name="similarMusicDeleteOutdatedEntries"
          label={t('deleteAutomaticallyOutdatedEntries')}
          comp="switch"
        >
          <Switch />
        </FormItem>
      </Form>
      <GroupTitle>{t('other')}</GroupTitle>
      <Button variant="secondary" onClick={handleOpenCacheFolder}>
        {t('openCacheFolder')}
      </Button>
    </ScrollArea>
  );
}

function GroupTitle(props: { children?: React.ReactNode }) {
  const { children } = props;

  return <h3 className="w-full text-center">{children}</h3>;
}
