import { useAtom, useAtomValue } from 'jotai';
import { Settings2 } from 'lucide-react';
import { currentToolAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  InputNumber,
  LabelCheckbox,
  OperationButton,
  Select,
  Slider,
  Switch,
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
import {
  BigFilesSearchMode,
  DuplicatesAvailableHashType,
  DuplicatesCheckMethod,
  SimilarImagesHashAlgorithm,
  SimilarImagesResizeAlgorithm,
  SimilarMusicAudioCheckType,
  Tools,
} from '~/consts';
import { useBoolean, useT } from '~/hooks';

const toolsWithoutSettings = new Set<string>([
  Tools.EmptyFolders,
  Tools.EmptyFiles,
  Tools.TemporaryFiles,
  Tools.InvalidSymlinks,
  Tools.BadExtensions,
]);

const settingsCompMap: Record<string, () => React.JSX.Element> = {
  [Tools.DuplicateFiles]: DuplicateFilesSettings,
  [Tools.BigFiles]: BigFilesSettings,
  [Tools.SimilarImages]: SimilarImagesSettings,
  [Tools.SimilarVideos]: SimilarVideosSettings,
  [Tools.MusicDuplicates]: MusicDuplicatesSettings,
  [Tools.BrokenFiles]: BrokenFilesSettings,
};

export function ToolSettings() {
  const currentTool = useAtomValue(currentToolAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const dialogOpen = useBoolean();
  const t = useT();

  if (toolsWithoutSettings.has(currentTool)) {
    return null;
  }

  const descMap: Record<string, string> = {
    [Tools.DuplicateFiles]: t('Duplicate files settings'),
    [Tools.BigFiles]: t('Big files settings'),
    [Tools.SimilarImages]: t('Similar images settings'),
    [Tools.SimilarVideos]: t('Similar videos settings'),
    [Tools.MusicDuplicates]: t('Music duplicates settings'),
    [Tools.BrokenFiles]: t('Broken files settings'),
  };

  const desc = descMap[currentTool];

  const handleSettingsChange = (v: Record<string, any>) => {
    setSettings((old) => ({ ...old, ...v }));
  };

  const SettingsComponent = settingsCompMap[currentTool] || Fallback;

  return (
    <Dialog open={dialogOpen.value} onOpenChange={dialogOpen.set}>
      <DialogTrigger asChild>
        <OperationButton>
          <Settings2 />
          {t('Tool settings')}
        </OperationButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Tool settings')}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <Form value={settings} onChange={handleSettingsChange}>
          <SettingsComponent />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function Fallback() {
  return <div>Something wrong</div>;
}

function DuplicateFilesSettings() {
  const t = useT();

  return (
    <>
      <FormItem
        name="duplicatesSubCheckMethod"
        label={t('Check method')}
        comp="select"
      >
        <Select
          options={[
            { label: t('Hash'), value: DuplicatesCheckMethod.Hash },
            { label: t('Name'), value: DuplicatesCheckMethod.Name },
            { label: t('Size'), value: DuplicatesCheckMethod.Size },
            {
              label: t('Size and name'),
              value: DuplicatesCheckMethod.SizeAndName,
            },
          ]}
        />
      </FormItem>
      <FormItem
        name="duplicatesSubAvailableHashType"
        label={t('Hash type')}
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
        label={t('Case sensitive')}
        comp="switch"
      >
        <Switch />
      </FormItem>
    </>
  );
}

function BigFilesSettings() {
  const t = useT();

  return (
    <>
      <FormItem
        name="biggestFilesSubMethod"
        label={t('Checked files')}
        comp="select"
      >
        <Select
          options={[
            { label: t('Biggest'), value: BigFilesSearchMode.BiggestFiles },
            { label: t('Smallest'), value: BigFilesSearchMode.SmallestFiles },
          ]}
        />
      </FormItem>
      <FormItem
        name="biggestFilesSubNumberOfFiles"
        label={t('Number of lines')}
        comp="input-number"
      >
        <InputNumber minValue={1} />
      </FormItem>
    </>
  );
}

function SimilarImagesSettings() {
  const settings = useAtomValue(settingsAtom);
  const t = useT();

  return (
    <>
      <FormItem
        name="similarImagesSubHashSize"
        label={t('Hash size')}
        comp="select"
      >
        <Select
          options={['8', '16', '32', '64'].map((value) => ({
            label: value,
            value,
          }))}
        />
      </FormItem>
      <FormItem
        name="similarImagesSubResizeAlgorithm"
        label={t('Resize algorithm')}
        comp="select"
      >
        <Select
          options={Object.values(SimilarImagesResizeAlgorithm).map((value) => ({
            label: value,
            value,
          }))}
        />
      </FormItem>
      <FormItem
        name="similarImagesSubHashAlg"
        label={t('Hash type')}
        comp="select"
      >
        <Select
          options={Object.values(SimilarImagesHashAlgorithm).map((value) => ({
            label: value,
            value,
          }))}
        />
      </FormItem>
      <FormItem
        name="similarImagesSubIgnoreSameSize"
        label={t('Ignore same size')}
        comp="select"
      >
        <Switch />
      </FormItem>
      <FormItem
        name="similarImagesSubSimilarity"
        label={t('Max difference')}
        comp="slider"
        suffix={<span>({settings.similarImagesSubSimilarity}/40)</span>}
      >
        <Slider min={0} max={40} />
      </FormItem>
    </>
  );
}

function SimilarVideosSettings() {
  const settings = useAtomValue(settingsAtom);
  const t = useT();

  return (
    <>
      <FormItem
        name="similarVideosSubSimilarity"
        label={t('Max difference')}
        comp="slider"
        suffix={<span>({settings.similarVideosSubSimilarity}/20)</span>}
      >
        <Slider min={0} max={20} />
      </FormItem>
      <FormItem
        name="similarVideosSubIgnoreSameSize"
        label={t('Ignore same size')}
        comp="switch"
      >
        <Switch />
      </FormItem>
    </>
  );
}

function MusicDuplicatesSettings() {
  const settings = useAtomValue(settingsAtom);
  const t = useT();

  return (
    <>
      <FormItem
        name="similarMusicSubAudioCheckType"
        label={t('Audio check type')}
        comp="select"
      >
        <Select
          options={Object.values(SimilarMusicAudioCheckType).map((value) => ({
            label: t(value),
            value,
          }))}
        />
      </FormItem>
      {settings.similarMusicSubAudioCheckType ===
        SimilarMusicAudioCheckType.Tags && (
        <>
          <FormItem
            name="similarMusicSubApproximateComparison"
            label={t('Approximate tag comparison')}
            comp="switch"
          >
            <Switch />
          </FormItem>
          <span className="text-center">{t('Compared tags')}</span>
          <div className="grid grid-cols-3 gap-2 *:pl-4">
            <FormItem name="similarMusicSubTitle" comp="checkbox">
              <LabelCheckbox label={t('Title')} />
            </FormItem>
            <FormItem name="similarMusicSubArtist" comp="checkbox">
              <LabelCheckbox label={t('Artist')} />
            </FormItem>
            <FormItem name="similarMusicSubBitrate" comp="checkbox">
              <LabelCheckbox label={t('Bitrate')} />
            </FormItem>
            <FormItem name="similarMusicSubGenre" comp="checkbox">
              <LabelCheckbox label={t('Genre')} />
            </FormItem>
            <FormItem name="similarMusicSubYear" comp="checkbox">
              <LabelCheckbox label={t('Year')} />
            </FormItem>
            <FormItem name="similarMusicSubLength" comp="checkbox">
              <LabelCheckbox label={t('Length')} />
            </FormItem>
          </div>
        </>
      )}
      {settings.similarMusicSubAudioCheckType ===
        SimilarMusicAudioCheckType.Fingerprint && (
        <>
          <FormItem
            name="similarMusicSubMaximumDifferenceValue"
            label={t('Max difference')}
            comp="slider"
            suffix={
              <span>({settings.similarMusicSubMaximumDifferenceValue}/10)</span>
            }
          >
            <Slider min={0} max={10} />
          </FormItem>
          <FormItem
            name="similarMusicSubMinimalFragmentDurationValue"
            label={t('Minimal fragment duration')}
            comp="slider"
            suffix={
              <span>
                {settings.similarMusicSubMinimalFragmentDurationValue}
              </span>
            }
          >
            <Slider min={0} max={180} />
          </FormItem>
          <FormItem
            name="similarMusicCompareFingerprintsOnlyWithSimilarTitles"
            label={t('Compare only with similar titles')}
            comp="switch"
          >
            <Switch />
          </FormItem>
        </>
      )}
    </>
  );
}

function BrokenFilesSettings() {
  const t = useT();

  return (
    <>
      <span className="text-center">{t('Type of files to check')}</span>
      <div className="grid grid-cols-4 justify-items-center">
        <FormItem name="brokenFilesSubAudio" comp="checkbox">
          <LabelCheckbox label={t('Audio')} />
        </FormItem>
        <FormItem name="brokenFilesSubPdf" comp="checkbox">
          <LabelCheckbox label={t('Pdf')} />
        </FormItem>
        <FormItem name="brokenFilesSubArchive" comp="checkbox">
          <LabelCheckbox label={t('Archive')} />
        </FormItem>
        <FormItem name="brokenFilesSubImage" comp="checkbox">
          <LabelCheckbox label={t('Image')} />
        </FormItem>
      </div>
    </>
  );
}
