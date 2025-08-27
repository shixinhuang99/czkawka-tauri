import { useEffect, useRef } from 'react';

export function useOnceEffect(fn: () => void) {
  const lock = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (lock.current) {
      return;
    }
    lock.current = true;
    fnRef.current();
  }, []);
}
