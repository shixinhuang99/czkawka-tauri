import { useAtom, useAtomValue } from 'jotai';
import { Settings2 } from 'lucide-react';
import { currentToolAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import { OperationButton } from '~/components';
import { InputNumber } from '~/components';
import { Select, Slider, Switch } from '~/components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/shadcn/dialog';
import { Form, FormItem } from '~/components/simple-form';
import {
  BigFilesSearchMode,
  DuplicatesAvailableHashType,
  DuplicatesCheckMethod,
  SimilarImagesHashAlgorithm,
  SimilarImagesResizeAlgorithm,
  Tools,
} from '~/consts';
import { useBoolean } from '~/hooks';

const descMap: Record<string, string> = {
  [Tools.DuplicateFiles]: 'Duplicate files settings',
  [Tools.BigFiles]: 'Big files settings',
  [Tools.SimilarImages]: 'Similar images settings',
  [Tools.SimilarVideos]: 'Similar videos settings',
  [Tools.MusicDuplicates]: 'Music duplicates settings',
  [Tools.InvalidSymlinks]: 'Invalid symlinks settings',
  [Tools.BrokenFiles]: 'Broken files settings',
  [Tools.BadExtensions]: 'Bad extensions settings',
};

const toolsWithoutSettings = new Set<string>([
  Tools.EmptyFolders,
  Tools.EmptyFiles,
  Tools.TemporaryFiles,
]);

export function ToolSettings() {
  const currentTool = useAtomValue(currentToolAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const dialogOpen = useBoolean();

  if (toolsWithoutSettings.has(currentTool)) {
    return null;
  }

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

  if (currentTool === Tools.DuplicateFiles) {
    return <DuplicateFilesSettings />;
  }

  if (currentTool === Tools.BigFiles) {
    return <BigFilesSettings />;
  }

  if (currentTool === Tools.SimilarImages) {
    return <SimilarImagesSettings />;
  }

  return null;
}

function DuplicateFilesSettings() {
  return (
    <>
      <FormItem
        name="duplicatesSubCheckMethod"
        label="Check method"
        comp="select"
      >
        <Select
          options={[
            { label: 'Hash', value: DuplicatesCheckMethod.Hash },
            { label: 'Name', value: DuplicatesCheckMethod.Name },
            { label: 'Size', value: DuplicatesCheckMethod.Size },
            {
              label: 'Size and name',
              value: DuplicatesCheckMethod.SizeAndName,
            },
          ]}
        />
      </FormItem>
      <FormItem
        name="duplicatesSubAvailableHashType"
        label="Hash type"
        comp="select"
      >
        <Select
          options={[
            { label: 'Blake3', value: DuplicatesAvailableHashType.Blake3 },
            { label: 'CRC32', value: DuplicatesAvailableHashType.CRC32 },
            { label: 'XXH3', value: DuplicatesAvailableHashType.XXH3 },
          ]}
        />
      </FormItem>
      <FormItem
        name="duplicatesSubNameCaseSensitive"
        label="Case sensitive(only name modes)"
        comp="switch"
      >
        <Switch />
      </FormItem>
    </>
  );
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

function SimilarImagesSettings() {
  const settings = useAtomValue(settingsAtom);

  return (
    <>
      <FormItem name="similarImagesSubHashSize" label="Hash size" comp="select">
        <Select
          options={['8', '16', '32', '64'].map((value) => ({
            label: value,
            value,
          }))}
        />
      </FormItem>
      <FormItem
        name="similarImagesSubResizeAlgorithm"
        label="Resize algorithm"
        comp="select"
      >
        <Select
          options={Object.values(SimilarImagesResizeAlgorithm).map((value) => ({
            label: value,
            value,
          }))}
        />
      </FormItem>
      <FormItem name="similarImagesSubHashAlg" label="Hash type" comp="select">
        <Select
          options={Object.values(SimilarImagesHashAlgorithm).map((value) => ({
            label: value,
            value,
          }))}
        />
      </FormItem>
      <FormItem
        name="similarImagesSubIgnoreSameSize"
        label="Ignore same size"
        comp="select"
      >
        <Switch />
      </FormItem>
      <FormItem
        name="similarImagesSubSimilarity"
        label="Max difference"
        comp="slider"
        suffix={<span>({settings.similarImagesSubSimilarity}/40)</span>}
      >
        <Slider min={1} max={40} />
      </FormItem>
    </>
  );
}
