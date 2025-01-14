import { DARK_MODE_MEDIA } from '~/consts';

export function isSystemDark() {
  return window.matchMedia(DARK_MODE_MEDIA).matches;
}
