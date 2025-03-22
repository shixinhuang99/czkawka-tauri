import { useTranslation as _useTranslation } from 'react-i18next';
import type { en } from '~/i18n/en';

type Keys = keyof typeof en;

export function useTranslation() {
  const { t } = _useTranslation();

  return t as (key: Keys, obj?: Record<string, any>) => string;
}
