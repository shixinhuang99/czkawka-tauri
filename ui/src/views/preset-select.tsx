import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  FilePenLineIcon,
  FilePlusIcon,
  TimerResetIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { currentPresetAtom } from '~/atom/preset';
import {
  excludedDirsRowSelectionAtom,
  includedDirsRowSelectionAtom,
  platformSettingsAtom,
  presetsAtom,
} from '~/atom/primitive';
import { EditInput, Label, Select, TooltipButton } from '~/components';
import { getDefaultSettings } from '~/consts';
import { useT } from '~/hooks';

interface PresetSelectProps {
  onPreventDialogCloseChange: (open: boolean) => void;
}

export function PresetSelect({
  onPreventDialogCloseChange,
}: PresetSelectProps) {
  const [presets, setPresets] = useAtom(presetsAtom);
  const platformSettings = useAtomValue(platformSettingsAtom);
  const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom);
  const setIncludedDirsRowSelection = useSetAtom(includedDirsRowSelectionAtom);
  const setExcludedDirsRowSelection = useSetAtom(excludedDirsRowSelectionAtom);
  const [newPresetInputVisible, setNewPresetInputVisible] = useState(false);
  const [editPresetInputVisible, setEditPresetInputVisible] = useState(false);
  const t = useT();

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
    setNewPresetInputVisible(false);
    setEditPresetInputVisible(false);
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
      onPreventDialogCloseChange(false);
      return t('nameAlreadyExists', { name });
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
      <Label>{t('currentPreset')}:</Label>
      {!(newPresetInputVisible || editPresetInputVisible) && (
        <Select
          className="flex-1"
          name="presetSelect"
          value={currentPreset.name}
          onValueChange={handlePresetSelect}
          onOpenChange={onPreventDialogCloseChange}
          options={presets.map((preset) => {
            return { label: preset.name, value: preset.name };
          })}
        />
      )}
      {newPresetInputVisible && (
        <EditInput
          className="flex-1"
          placeholder={t('newPresetName')}
          name="newPresetName"
          onOk={handleAddPresetOk}
          onValidate={handleNamingPresetValidate}
          onCancel={handleAddOrEditPresetCancel}
        />
      )}
      {editPresetInputVisible && (
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
          tooltip={t('addPreset')}
          onClick={() => {
            setNewPresetInputVisible(true);
            onPreventDialogCloseChange(true);
          }}
          disabled={editPresetInputVisible}
        >
          <FilePlusIcon />
        </TooltipButton>
        <TooltipButton
          tooltip={t('editName')}
          onClick={() => {
            setEditPresetInputVisible(true);
            onPreventDialogCloseChange(true);
          }}
          disabled={newPresetInputVisible}
        >
          <FilePenLineIcon />
        </TooltipButton>
        <TooltipButton
          tooltip={t('removePreset')}
          onClick={handlePresetRemove}
          disabled={
            presets.length === 1 ||
            newPresetInputVisible ||
            editPresetInputVisible
          }
        >
          <Trash2Icon />
        </TooltipButton>
        <TooltipButton
          tooltip={t('resetSettings')}
          onClick={handleSettingsReset}
        >
          <TimerResetIcon />
        </TooltipButton>
      </span>
    </div>
  );
}
