import { useState } from 'react';

export function useBoolean() {
  const [value, setValue] = useState(false);

  return {
    value,
    on() {
      setValue(true);
    },
    off() {
      setValue(false);
    },
    set(v: boolean) {
      setValue(v);
    },
  };
}
