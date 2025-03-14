export function eventPreventDefault(e: any) {
  (e as Event).preventDefault();
}

// todo: delete
class EventEmitter extends EventTarget {
  emit(name: string) {
    this.dispatchEvent(new Event(name));
  }

  on(name: string, listener: (e: Event) => void) {
    this.addEventListener(name, listener);
  }

  off(name: string, listener: (e: Event) => void) {
    this.removeEventListener(name, listener);
  }
}

export const emitter = new EventEmitter();
