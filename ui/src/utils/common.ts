import { Tools } from '~/consts';
import type { ToolsValues } from '~/types';

export function splitStr(s: string): string[] {
  return s
    .replace(/[\u2068\u2069]/g, '')
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const toolSet = new Set<string>(Object.values(Tools));

export function isValidTool(s: string): s is ToolsValues {
  return toolSet.has(s);
}

export function is2DArray<T>(value: unknown): value is T[][] {
  return Array.isArray(value) && value.length > 0 && Array.isArray(value[0]);
}
