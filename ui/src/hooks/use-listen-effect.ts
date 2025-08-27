import { listen } from '@tauri-apps/api/event';
import { useOnceEffect } from './use-once-effect';

export function useListenEffect<T>(name: string, fn: (v: T) => void) {
  useOnceEffect(() => {
    listen<T>(name, (e) => {
      fn(e.payload);
    });
  });
}
