export interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignRef?: string;
  defaultValue?: string;
  description: string;
}

export interface TableDef {
  name: string;
  domain: string;
  description: string;
  columns: ColumnDef[];
  indexes: string[];
  concurrencyStrategy: string;
}

export interface SampleTransaction {
  id: number;
  date: string;
  account: string;
  category: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  merchant: string;
  isRecurring: boolean;
  checksum: string;
}
