import { openPath } from '@tauri-apps/plugin-opener';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { CircleHelp, Settings } from 'lucide-react';
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
      // checkOpenedSelect={false}
    >
      <DialogTrigger asChild>
        <TooltipButton tooltip={t('Settings')}>
          <Settings />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="max-w-[700px] outline-none">
        <DialogHeader>
          <DialogTitle>{t('Settings')}</DialogTitle>
          <DialogDescription>{t('Application settings')}</DialogDescription>
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
      toastError(t('Failed to open cache folder'), err);
    });
  };

  return (
    <ScrollArea className="flex-1">
      <Form className="pr-3" value={settings} onChange={handleSettingsChange}>
        <GroupTitle>{t('General settings')}</GroupTitle>
        <FormItem
          name="excludedItems"
          label={t('Excluded items')}
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <FormItem
          name="allowedExtensions"
          label={t('Allowed extensions')}
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <FormItem
          name="excludedExtensions"
          label={t('Excluded extensions')}
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <div className="flex items-center gap-2">
          <Label className="shrink-0">{t('File size')}(KB):</Label>
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
          label={t('Recursive search')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem name="useCache" label={t('Use cache')} comp="switch">
          <Switch />
        </FormItem>
        <FormItem
          name="saveAlsoAsJson"
          label={t('Also save cache as JSON file')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="moveDeletedFilesToTrash"
          label={t('Move deleted files to trash')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="threadNumber"
          label={
            <span className="inline-flex items-center">
              {t('Thread number')}
              <TooltipButton
                tooltip={t('Thread number tip')}
                onClick={eventPreventDefault}
              >
                <CircleHelp />
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
        <GroupTitle>{t('Duplicate Files')}</GroupTitle>
        <FormItem
          name="duplicateMinimalHashCacheSize"
          label={`${t('Minimal size of cached files')} - ${t('Hash')} (KB)`}
          comp="input-number"
        >
          <InputNumber minValue={1} />
        </FormItem>
        <FormItem
          name="duplicateMinimalPrehashCacheSize"
          label={`${t('Minimal size of cached files')} - ${t('Prehash')} (KB)`}
          comp="input-number"
        >
          <InputNumber minValue={1} />
        </FormItem>
        <FormItem
          name="duplicateImagePreview"
          label={t('Image preview')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="duplicateHideHardLinks"
          label={t('Hide hard links')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="duplicateUsePrehash"
          label={t('Use prehash')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="duplicateDeleteOutdatedEntries"
          label={t('Delete automatically outdated entries')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <GroupTitle>{t('Similar Images')}</GroupTitle>
        <FormItem
          name="similarImagesShowImagePreview"
          label={t('Image preview')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="similarImagesHideHardLinks"
          label={t('Hide hard links')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="similarImagesDeleteOutdatedEntries"
          label={t('Delete automatically outdated entries')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <GroupTitle>{t('Similar Videos')}</GroupTitle>
        <FormItem
          name="similarVideosHideHardLinks"
          label={t('Hide hard links')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="similarVideosDeleteOutdatedEntries"
          label={t('Delete automatically outdated entries')}
          comp="switch"
        >
          <Switch />
        </FormItem>
        <GroupTitle>{t('Music Duplicates')}</GroupTitle>
        <FormItem
          name="similarMusicDeleteOutdatedEntries"
          label={t('Delete automatically outdated entries')}
          comp="switch"
        >
          <Switch />
        </FormItem>
      </Form>
      <GroupTitle>{t('Other')}</GroupTitle>
      <Button variant="secondary" onClick={handleOpenCacheFolder}>
        {t('Open cache folder')}
      </Button>
    </ScrollArea>
  );
}

function GroupTitle(props: { children?: React.ReactNode }) {
  const { children } = props;

  return <h3 className="w-full text-center">{children}</h3>;
}
