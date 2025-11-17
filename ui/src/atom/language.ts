import { atom } from 'jotai';
import { languageAtom } from './primitive';

export const setLanguageAtom = atom(null, (_, set, v: string) => {
  set(languageAtom, v);
  document.documentElement.lang = v;
});
