import { useAtom, useSetAtom } from 'jotai';
import { CircleHelp, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { initPlatformSettingsAtom } from '~/atom/preset';
import { settingsAtom } from '~/atom/settings';
import {
  InputNumber,
  Label,
  ScrollArea,
  Slider,
  Switch,
  Textarea,
  TooltipButton,
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
import { useBoolean } from '~/hooks';
import { eventPreventDefault } from '~/utils/event';
import { PresetSelect } from './preset-select';

export function SettingsButton() {
  const dialogOpen = useBoolean();
  const isPreventDialogClose = useBoolean();
  const initPlatformSettings = useSetAtom(initPlatformSettingsAtom);

  useEffect(() => {
    initPlatformSettings();
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
        <TooltipButton tooltip="Settings">
          <Settings />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="max-w-[700px] outline-none">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Application settings</DialogDescription>
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

  const handleSettingsChange = (v: Record<string, any>) => {
    setSettings((prev) => ({ ...prev, ...v }));
  };

  return (
    <ScrollArea className="flex-1">
      <Form className="pr-3" value={settings} onChange={handleSettingsChange}>
        <GroupTitle>General settings</GroupTitle>
        <FormItem name="excludedItems" label="Excluded items" comp="textarea">
          <Textarea rows={2} />
        </FormItem>
        <FormItem
          name="allowedExtensions"
          label="Allowed extensions"
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <FormItem
          name="excludedExtensions"
          label="Excluded extensions"
          comp="textarea"
        >
          <Textarea rows={2} />
        </FormItem>
        <div className="flex items-center gap-2">
          <Label className="flex-shrink-0">File size(KB):</Label>
          <FormItem name="minimumFileSize" comp="input-number">
            <InputNumber minValue={16} maxValue={MAXIMUM_FILE_SIZE} />
          </FormItem>
          ~
          <FormItem name="maximumFileSize" comp="input-number">
            <InputNumber minValue={16} maxValue={MAXIMUM_FILE_SIZE} />
          </FormItem>
        </div>
        <FormItem name="recursiveSearch" label="Recursive search" comp="switch">
          <Switch />
        </FormItem>
        <FormItem name="useCache" label="Use cache" comp="switch">
          <Switch />
        </FormItem>
        <FormItem
          name="saveAlsoAsJson"
          label="Also save cache as JSON file"
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="moveDeletedFilesToTrash"
          label="Move deleted files to trash"
          comp="switch"
        >
          <Switch />
        </FormItem>
        <FormItem
          name="threadNumber"
          label={
            <span className="inline-flex items-center">
              Thread number
              <TooltipButton
                tooltip="You need to restart app to apply changes in thread number"
                onClick={eventPreventDefault}
              >
                <CircleHelp />
              </TooltipButton>
            </span>
          }
          comp="slider"
          suffix={
            <span>
              {settings.threadNumber}/{settings.availableThreadNumber}
            </span>
          }
        >
          <Slider min={1} max={settings.availableThreadNumber} />
        </FormItem>
      </Form>
    </ScrollArea>
  );
}

function GroupTitle(props: { children?: React.ReactNode }) {
  const { children } = props;

  return <h3 className="w-full text-center">{children}</h3>;
}
