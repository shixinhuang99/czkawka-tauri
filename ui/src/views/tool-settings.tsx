import { useAtom, useAtomValue } from 'jotai';
import { currentToolAtom } from '~/atom/primitive';
import { settingsAtom } from '~/atom/settings';
import {
  InputNumber,
  LabelCheckbox,
  ScrollArea,
  Select,
  Slider,
  SliderValue,
  Switch,
} from '~/components';
import { Form, FormItem, RawFormItem } from '~/components/form';
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
      <div className="flex-1 rounded-md border text-card-foreground flex items-center justify-center">
        <div className="text-muted-foreground">
          {t('noSettingsForThisTool')}
        </div>
      </div>
    );
  }

  const SettingsComponent = settingsCompMap[currentTool] || Fallback;

  return (
    <ScrollArea className="flex-1 rounded-md border text-card-foreground">
      <Form
        className="px-6 py-6 grid grid-cols-2 gap-6"
        value={settings}
        onChange={handleSettingsChange}
      >
        <SettingsComponent />
      </Form>
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
          className="w-[75%]"
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
          className="w-[75%]"
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
          className="w-[75%]"
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
        <InputNumber className="w-[75%]" minValue={1} />
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
          className="w-[75%]"
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
          className="w-[75%]"
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
          className="w-[75%]"
          options={Object.values(SimilarImagesHashAlgorithm).map((value) => ({
            label: value,
            value,
          }))}
        />
      </FormItem>
      <FormItem
        name="similarImagesSubIgnoreSameSize"
        label={t('ignoreSameSize')}
        comp="switch"
      >
        <Switch />
      </FormItem>
      <FormItem
        name="similarImagesSubSimilarity"
        label={t('maxDifference')}
        comp="slider"
      >
        {(slotProps) => (
          <div className="flex items-center gap-2 w-[75%]">
            <Slider min={0} max={40} id={slotProps.name} {...slotProps} />
            <SliderValue
              className="w-11"
              value={settings.similarImagesSubSimilarity}
              max={40}
            />
          </div>
        )}
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
      >
        {(slotProps) => (
          <div className="flex items-center gap-2 w-[75%]">
            <Slider min={0} max={20} id={slotProps.name} {...slotProps} />
            <SliderValue
              className="w-11"
              value={settings.similarVideosSubSimilarity}
              max={20}
            />
          </div>
        )}
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
          className="w-[60%]"
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
          <RawFormItem label={t('comparedTags')}>
            <div className="grid grid-cols-3 gap-2 w-[60%]">
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
          </RawFormItem>
        </>
      )}
      {settings.similarMusicSubAudioCheckType ===
        SimilarMusicAudioCheckType.Fingerprint && (
        <>
          <FormItem
            name="similarMusicSubMaximumDifferenceValue"
            label={t('maxDifference')}
            comp="slider"
          >
            {(slotProps) => (
              <div className="flex items-center gap-2 w-[55%]">
                <Slider min={0} max={10} id={slotProps.name} {...slotProps} />
                <SliderValue
                  value={settings.similarMusicSubMaximumDifferenceValue}
                  max={10}
                />
              </div>
            )}
          </FormItem>
          <FormItem
            name="similarMusicSubMinimalFragmentDurationValue"
            label={t('minimalFragmentDuration')}
            comp="slider"
          >
            {(slotProps) => (
              <div className="flex items-center gap-2 w-[60%]">
                <Slider min={0} max={180} id={slotProps.name} {...slotProps} />
                <SliderValue
                  className="w-[58px]"
                  value={settings.similarMusicSubMinimalFragmentDurationValue}
                  max={180}
                />
              </div>
            )}
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
    <RawFormItem label={t('typeOfFilesToCheck')}>
      <div className="flex gap-4">
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
    </RawFormItem>
  );
}
