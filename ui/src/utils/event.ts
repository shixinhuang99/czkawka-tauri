export function eventPreventDefault<T extends Event>(e: T) {
  e.preventDefault();
}
