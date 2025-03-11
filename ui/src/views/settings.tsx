import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  CircleHelp,
  FilePenLine,
  FilePlus,
  RotateCcw,
  Settings as SettingsIcon,
  Trash2,
} from 'lucide-react';
import { useEffect } from 'react';
import { currentPresetAtom, initPlatformSettingsAtom } from '~/atom/preset';
import { platformSettingsAtom, presetsAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  EditInput,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/shadcn/select';
import { Form, FormItem } from '~/components/simple-form';
import { MAXIMUM_FILE_SIZE, getDefaultSettings } from '~/consts';
import { useBoolean } from '~/hooks';
import { emitter, eventPreventDefault } from '~/utils/event';

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
    >
      <DialogTrigger asChild>
        <TooltipButton tooltip="Settings">
          <SettingsIcon />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent
        className="max-w-[700px] outline-none"
        onOpenAutoFocus={eventPreventDefault}
      >
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

function PresetSelect(props: {
  onPreventDialogCloseChange: (open: boolean) => void;
}) {
  const { onPreventDialogCloseChange } = props;

  const [presets, setPresets] = useAtom(presetsAtom);
  const platformSettings = useAtomValue(platformSettingsAtom);
  const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom);
  const newPresetInputVisible = useBoolean();
  const editPresetInputVisible = useBoolean();

  const handlePresetSelect = (name: string) => {
    setPresets(
      presets.map((preset) => {
        if (preset.name === name) {
          return { ...preset, active: true };
        }
        return { ...preset, active: false };
      }),
    );
  };

  const handleAddOrEditPresetCancel = () => {
    newPresetInputVisible.off();
    editPresetInputVisible.off();
    onPreventDialogCloseChange(false);
  };

  const handleAddPresetOk = (name: string) => {
    setPresets([
      ...presets.map((preset) => {
        return { ...preset, active: false };
      }),
      {
        name,
        active: true,
        changed: false,
        settings: {
          ...getDefaultSettings(),
          ...platformSettings,
          threadNumber: platformSettings.availableThreadNumber,
        },
      },
    ]);
    handleAddOrEditPresetCancel();
  };

  const handleNamingPresetValidate = (name: string) => {
    if (presets.some((preset) => preset.name === name)) {
      return `\`${name}\` already exists`;
    }
  };

  const handleEditPresetNameOk = (name: string) => {
    setCurrentPreset({ name });
    handleAddOrEditPresetCancel();
  };

  const handlePresetRemove = () => {
    const newPresets = presets.filter((preset) => !preset.active);
    newPresets[0].active = true;
    setPresets(newPresets);
  };

  const handleSettingsReset = () => {
    setCurrentPreset({
      settings: {
        ...getDefaultSettings(),
        ...platformSettings,
        threadNumber: platformSettings.availableThreadNumber,
      },
    });
    emitter.emit('reset-settings');
  };

  return (
    <div className="flex items-center gap-1 pb-2 border-b">
      <Label>Current preset:</Label>
      {!(newPresetInputVisible.value || editPresetInputVisible.value) && (
        <Select
          value={currentPreset.name}
          onValueChange={handlePresetSelect}
          onOpenChange={onPreventDialogCloseChange}
          name="presetSelect"
        >
          <SelectTrigger className="flex-1 dark:bg-black">
            <SelectValue placeholder="Please select a preset" />
          </SelectTrigger>
          <SelectContent onCloseAutoFocus={eventPreventDefault}>
            {presets.map((preset) => {
              return (
                <SelectItem
                  className="hover:bg-accent hover:text-accent-foreground"
                  key={preset.name}
                  value={preset.name}
                >
                  {preset.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
      {newPresetInputVisible.value && (
        <EditInput
          className="flex-1"
          placeholder="New preset name"
          name="newPresetName"
          onOk={handleAddPresetOk}
          onValidate={handleNamingPresetValidate}
          onCancel={handleAddOrEditPresetCancel}
        />
      )}
      {editPresetInputVisible.value && (
        <EditInput
          className="flex-1"
          placeholder={currentPreset.name}
          initValue={currentPreset.name}
          name="editPresetName"
          onOk={handleEditPresetNameOk}
          onValidate={handleNamingPresetValidate}
          onCancel={handleAddOrEditPresetCancel}
          selectAllWhenMounted
        />
      )}
      <span>
        <TooltipButton
          tooltip="Add preset"
          onClick={() => {
            newPresetInputVisible.on();
            onPreventDialogCloseChange(true);
          }}
          disabled={editPresetInputVisible.value}
        >
          <FilePlus />
        </TooltipButton>
        <TooltipButton
          tooltip="Edit name"
          onClick={() => {
            editPresetInputVisible.on();
            onPreventDialogCloseChange(true);
          }}
          disabled={newPresetInputVisible.value}
        >
          <FilePenLine />
        </TooltipButton>
        <TooltipButton
          tooltip="Remove preset"
          onClick={handlePresetRemove}
          disabled={
            presets.length === 1 ||
            newPresetInputVisible.value ||
            editPresetInputVisible.value
          }
        >
          <Trash2 />
        </TooltipButton>
        <TooltipButton tooltip="Reset settings" onClick={handleSettingsReset}>
          <RotateCcw />
        </TooltipButton>
      </span>
    </div>
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
          <Label className="flex-shrink-0">File size(KiB):</Label>
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
