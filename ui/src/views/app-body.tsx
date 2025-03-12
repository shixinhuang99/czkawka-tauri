import { useAtomValue } from 'jotai';
import { toolsCfgAtom } from '~/atom/primitive';
import { Tools } from '~/consts';
import { BigFiles } from './big-files';

export function AppBody() {
  return (
    <div className="flex-1 flex flex-col w-px">
      <AllTable />
      <div className="h-16 border-t">progress</div>
    </div>
  );
}

function AllTable() {
  const toolsCfg = useAtomValue(toolsCfgAtom);

  if (toolsCfg.current === Tools.BigFiles) {
    return <BigFiles />;
  }

  return <div>todo</div>;
}
