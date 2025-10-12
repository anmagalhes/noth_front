// src/types/tabela.ts
import { ColumnDef } from '@tanstack/react-table'

// Define coluna com meta que pode ter className
export type ColumnWithMeta<T> = ColumnDef<T> & {
  meta?: {
    className?: string
  }
}
