import { useAtom, useAtomValue } from 'jotai';
import { Settings2 } from 'lucide-react';
import { currentToolAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { OperationButton } from '~/components';
import { InputNumber } from '~/components';
import { Select } from '~/components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/shadcn/dialog';
import { Form, FormItem } from '~/components/simple-form';
import { BigFilesSearchMode, Tools } from '~/consts';
import { useBoolean } from '~/hooks';

const descMap: Record<string, string> = {
  [Tools.DuplicateFiles]: 'Duplicate files settings',
  [Tools.EmptyFolders]: 'Empty folders settings',
  [Tools.BigFiles]: 'Big files settings',
  [Tools.EmptyFiles]: 'Empty files settings',
  [Tools.TemporaryFiles]: 'Temporary files settings',
  [Tools.SimilarImages]: 'Similar images settings',
  [Tools.SimilarVideos]: 'Similar videos settings',
  [Tools.MusicDuplicates]: 'Music duplicates settings',
  [Tools.InvalidSymlinks]: 'Invalid symlinks settings',
  [Tools.BrokenFiles]: 'Broken files settings',
  [Tools.BadExtensions]: 'Bad extensions settings',
};

export function ToolSettings() {
  const currentTool = useAtomValue(currentToolAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const dialogOpen = useBoolean();

  const desc = descMap[currentTool];

  const handleSettingsChange = (v: Record<string, any>) => {
    setSettings((old) => ({ ...old, ...v }));
  };

  return (
    <Dialog open={dialogOpen.value} onOpenChange={dialogOpen.set}>
      <DialogTrigger asChild>
        <OperationButton>
          <Settings2 />
          Tool settings
        </OperationButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tool settings</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <Form value={settings} onChange={handleSettingsChange}>
          <AllSettings currentTool={currentTool} />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AllSettings(props: { currentTool: string }) {
  const { currentTool } = props;

  if (currentTool === Tools.BigFiles) {
    return <BigFilesSettings />;
  }
}

function BigFilesSettings() {
  return (
    <>
      <FormItem
        name="biggestFilesSubMethod"
        label="Checked files"
        comp="select"
      >
        <Select
          options={[
            { label: 'Biggest', value: BigFilesSearchMode.BiggestFiles },
            { label: 'Smallest', value: BigFilesSearchMode.SmallestFiles },
          ]}
        />
      </FormItem>
      <FormItem
        name="biggestFilesSubNumberOfFiles"
        label="Number of lines"
        comp="input-number"
      >
        <InputNumber minValue={1} />
      </FormItem>
    </>
  );
}
