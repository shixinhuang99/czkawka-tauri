import { useAtom, useAtomValue } from 'jotai';
import { currentToolAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  InputNumber,
  LabelCheckbox,
  ScrollArea,
  Select,
  Slider,
  Switch,
} from '~/components';
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
import { useT } from '~/hooks';
import type { TranslationKeys } from '~/i18n/en';

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
  const t = useT();

  const handleSettingsChange = (v: Record<string, any>) => {
    setSettings((old) => ({ ...old, ...v }));
  };

  if (toolsWithoutSettings.has(currentTool)) {
    return (
      <div className="flex-1 rounded-md border text-card-foreground dark:bg-gray-900 flex items-center justify-center">
        <div className="text-muted-foreground">
          {t('noSettingsForThisTool')}
        </div>
      </div>
    );
  }

  const SettingsComponent = settingsCompMap[currentTool] || Fallback;

  return (
    <ScrollArea className="flex-1 rounded-md border text-card-foreground dark:bg-gray-900">
      <div className="px-4 py-3">
        <Form value={settings} onChange={handleSettingsChange}>
          <SettingsComponent />
        </Form>
      </div>
    </ScrollArea>
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
        label={t('checkMethod')}
        comp="select"
      >
        <Select
          options={[
            { label: t('hash'), value: DuplicatesCheckMethod.Hash },
            { label: t('name'), value: DuplicatesCheckMethod.Name },
            { label: t('size'), value: DuplicatesCheckMethod.Size },
            {
              label: t('sizeAndName'),
              value: DuplicatesCheckMethod.SizeAndName,
            },
          ]}
        />
      </FormItem>
      <FormItem
        name="duplicatesSubAvailableHashType"
        label={t('hashType')}
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
        label={t('caseSensitive')}
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
        label={t('checkedFiles')}
        comp="select"
      >
        <Select
          options={[
            { label: t('biggest'), value: BigFilesSearchMode.BiggestFiles },
            { label: t('smallest'), value: BigFilesSearchMode.SmallestFiles },
          ]}
        />
      </FormItem>
      <FormItem
        name="biggestFilesSubNumberOfFiles"
        label={t('numberOfLines')}
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
        label={t('hashSize')}
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
        label={t('resizeAlgorithm')}
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
        label={t('hashType')}
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
        label={t('ignoreSameSize')}
        comp="select"
      >
        <Switch />
      </FormItem>
      <FormItem
        name="similarImagesSubSimilarity"
        label={t('maxDifference')}
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
        label={t('maxDifference')}
        comp="slider"
        suffix={<span>({settings.similarVideosSubSimilarity}/20)</span>}
      >
        <Slider min={0} max={20} />
      </FormItem>
      <FormItem
        name="similarVideosSubIgnoreSameSize"
        label={t('ignoreSameSize')}
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
        label={t('audioCheckType')}
        comp="select"
      >
        <Select
          options={Object.values(SimilarMusicAudioCheckType).map((value) => ({
            label: t(value.toLowerCase() as TranslationKeys),
            value,
          }))}
        />
      </FormItem>
      {settings.similarMusicSubAudioCheckType ===
        SimilarMusicAudioCheckType.Tags && (
        <>
          <FormItem
            name="similarMusicSubApproximateComparison"
            label={t('approximateTagComparison')}
            comp="switch"
          >
            <Switch />
          </FormItem>
          <span className="text-center">{t('comparedTags')}</span>
          <div className="grid grid-cols-3 gap-2 *:pl-4">
            <FormItem name="similarMusicSubTitle" comp="checkbox">
              <LabelCheckbox label={t('title')} />
            </FormItem>
            <FormItem name="similarMusicSubArtist" comp="checkbox">
              <LabelCheckbox label={t('artist')} />
            </FormItem>
            <FormItem name="similarMusicSubBitrate" comp="checkbox">
              <LabelCheckbox label={t('bitrate')} />
            </FormItem>
            <FormItem name="similarMusicSubGenre" comp="checkbox">
              <LabelCheckbox label={t('genre')} />
            </FormItem>
            <FormItem name="similarMusicSubYear" comp="checkbox">
              <LabelCheckbox label={t('year')} />
            </FormItem>
            <FormItem name="similarMusicSubLength" comp="checkbox">
              <LabelCheckbox label={t('length')} />
            </FormItem>
          </div>
        </>
      )}
      {settings.similarMusicSubAudioCheckType ===
        SimilarMusicAudioCheckType.Fingerprint && (
        <>
          <FormItem
            name="similarMusicSubMaximumDifferenceValue"
            label={t('maxDifference')}
            comp="slider"
            suffix={
              <span>({settings.similarMusicSubMaximumDifferenceValue}/10)</span>
            }
          >
            <Slider min={0} max={10} />
          </FormItem>
          <FormItem
            name="similarMusicSubMinimalFragmentDurationValue"
            label={t('minimalFragmentDuration')}
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
            label={t('compareOnlyWithSimilarTitles')}
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
      <span className="text-center">{t('typeOfFilesToCheck')}</span>
      <div className="grid grid-cols-4 justify-items-center">
        <FormItem name="brokenFilesSubAudio" comp="checkbox">
          <LabelCheckbox label={t('audio')} />
        </FormItem>
        <FormItem name="brokenFilesSubPdf" comp="checkbox">
          <LabelCheckbox label={t('pdf')} />
        </FormItem>
        <FormItem name="brokenFilesSubArchive" comp="checkbox">
          <LabelCheckbox label={t('archive')} />
        </FormItem>
        <FormItem name="brokenFilesSubImage" comp="checkbox">
          <LabelCheckbox label={t('image')} />
        </FormItem>
      </div>
    </>
  );
}
