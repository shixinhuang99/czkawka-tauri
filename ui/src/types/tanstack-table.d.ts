import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta {
    span: number;
  }
}
