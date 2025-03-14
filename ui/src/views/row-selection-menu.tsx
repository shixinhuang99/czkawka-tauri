import { useAtomValue, useSetAtom } from 'jotai';
import { SquareMousePointer } from 'lucide-react';
import {
  bigFilesAtom,
  bigFilesRowSelectionAtom,
  currentToolAtom,
} from '~/atom/primitive';
import { OperationButton } from '~/components';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/shadcn/dropdown-menu';
import { Tools } from '~/consts';
import { getRowSelectionKeys } from '~/utils/common';

interface RowSelectionMenuProps {
  disabled: boolean;
}

export function RowSelectionMenu(props: RowSelectionMenuProps) {
  const { disabled } = props;

  const currentTool = useAtomValue(currentToolAtom);
  const bigFiles = useAtomValue(bigFilesAtom);
  const setBigFilesRowSelection = useSetAtom(bigFilesRowSelectionAtom);

  const handleInvertSelection = () => {
    if (currentTool === Tools.BigFiles) {
      const paths = bigFiles.map((v) => v.path);
      setBigFilesRowSelection((old) => {
        const selected = getRowSelectionKeys(old);
        const unselected = paths.filter((v) => !selected.includes(v));
        return Object.fromEntries(
          unselected.map((v) => {
            return [v, true];
          }),
        );
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <OperationButton disabled={disabled}>
          <SquareMousePointer />
          Select
        </OperationButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuItem onClick={handleInvertSelection}>
          Invert selection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
