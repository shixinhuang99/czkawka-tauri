import { useTranslation } from 'react-i18next';
import type { TranslationKeys } from '~/i18n/en';

export function useT() {
  const { t } = useTranslation();

  return t as (key: TranslationKeys, obj?: Record<string, any>) => string;
}
