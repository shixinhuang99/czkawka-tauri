import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  FilePenLine,
  FilePlus,
  RotateCcw,
  Settings as SettingsIcon,
  Trash2,
} from 'lucide-react';
import {
  addPresetAtom,
  changeCurrentPresetAtom,
  currentPresetAtom,
  removePresetAtom,
} from '~/atom/preset';
import { PresetsAtom } from '~/atom/primitive';
import { Label, ScrollArea, TooltipButton } from '~/components';
import { EditInput } from '~/components/edit-input';
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
import { useBoolean } from '~/hooks';
import { eventPreventDefault } from '~/utils/event';

function PresetSelect(props: {
  onPreventDialogCloseChange: (open: boolean) => void;
}) {
  const { onPreventDialogCloseChange } = props;

  const presets = useAtomValue(PresetsAtom);
  const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom);
  const changeCurrentPreset = useSetAtom(changeCurrentPresetAtom);
  const addPreset = useSetAtom(addPresetAtom);
  const removePreset = useSetAtom(removePresetAtom);
  const newPresetInputVisible = useBoolean();
  const editPresetInputVisible = useBoolean();

  const handleAddOrEditPresetCancel = () => {
    newPresetInputVisible.off();
    editPresetInputVisible.off();
    onPreventDialogCloseChange(false);
  };

  const handleAddPresetOk = (name: string) => {
    addPreset(name);
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

  return (
    <div className="flex items-center gap-1">
      <Label>Current preset:</Label>
      {!(newPresetInputVisible.value || editPresetInputVisible.value) && (
        <Select
          value={currentPreset.name}
          onValueChange={changeCurrentPreset}
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
          onClick={removePreset}
          disabled={
            presets.length === 1 ||
            newPresetInputVisible.value ||
            editPresetInputVisible.value
          }
        >
          <Trash2 />
        </TooltipButton>
        <TooltipButton tooltip="Reset preset">
          <RotateCcw />
        </TooltipButton>
      </span>
    </div>
  );
}

export function SettingsButton() {
  const dialogOpen = useBoolean();
  const isPreventDialogClose = useBoolean();

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
        className="max-w-[550px] outline-none"
        onOpenAutoFocus={eventPreventDefault}
        onCloseAutoFocus={eventPreventDefault}
        disableAnimate
      >
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Application settings</DialogDescription>
        </DialogHeader>
        <div className="h-[60vh]">
          <PresetSelect onPreventDialogCloseChange={isPreventDialogClose.set} />
          <ScrollArea className="h-full">...</ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
