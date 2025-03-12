export function splitStr(s: string): string[] {
  return s
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
