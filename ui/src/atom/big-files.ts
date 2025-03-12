import { atom } from 'jotai';
import { ipc } from '~/ipc';
import { bigFilesAtom, logsAtom } from './primitive';
import { settingsAtom } from './settings';

export const scanBigFilesAtom = atom(null, async (get, set) => {
  const settings = get(settingsAtom);
  const data = await ipc.scanBigFiles(settings);
  set(bigFilesAtom, data.files);
  set(logsAtom, data.message);
});
