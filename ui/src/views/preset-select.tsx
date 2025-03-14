import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { FilePenLine, FilePlus, RotateCcw, Trash2 } from 'lucide-react';
import { currentPresetAtom } from '~/atom/preset';
import {
  excludedDirsRowSelectionAtom,
  includedDirsRowSelectionAtom,
  platformSettingsAtom,
  presetsAtom,
} from '~/atom/primitive';
import { EditInput, Label, Select, TooltipButton } from '~/components';
import { getDefaultSettings } from '~/consts';
import { useBoolean } from '~/hooks';

interface PresetSelectProps {
  onPreventDialogCloseChange: (open: boolean) => void;
}

export function PresetSelect(props: PresetSelectProps) {
  const { onPreventDialogCloseChange } = props;

  const [presets, setPresets] = useAtom(presetsAtom);
  const platformSettings = useAtomValue(platformSettingsAtom);
  const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom);
  const setIncludedDirsRowSelection = useSetAtom(includedDirsRowSelectionAtom);
  const setExcludedDirsRowSelection = useSetAtom(excludedDirsRowSelectionAtom);
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
    setIncludedDirsRowSelection({});
    setExcludedDirsRowSelection({});
  };

  return (
    <div className="flex items-center gap-1 pb-2 border-b">
      <Label>Current preset:</Label>
      {!(newPresetInputVisible.value || editPresetInputVisible.value) && (
        <Select
          name="presetSelect"
          value={currentPreset.name}
          onChange={handlePresetSelect}
          onPreventDialogCloseChange={onPreventDialogCloseChange}
          options={presets.map((preset) => {
            return { label: preset.name, value: preset.name };
          })}
        />
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
