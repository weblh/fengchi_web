// 财务数据类型定义
export interface FinancialData {
  total: number;
  cashBalance: number;
  bankBalance: number;
  otherBalance: number;
  dailyUsagePlan: DailyUsagePlan[];
  supplierFundingPlan: SupplierFundingPlan[];
  receivables: Receivables[];
  collectionDetails: CollectionDetail[];
  totalReceivables: number;
  receivablesByCategory: ReceivablesByCategory[];
}

export interface DailyUsagePlan {
  date: string;
  amount: number;
}

export interface SupplierFundingPlan {
  supplier: string;
  plan: {
    cash: number;
    bank: number;
    other: number;
  };
}

export interface Receivables {
  category: string;
  currentTotal: number;
  historicalTotal: number;
}

export interface CollectionDetail {
  type: string;
  amount: number;
  percentage: number;
}

export interface ReceivablesByCategory {
  category: string;
  amount: number;
  percentage: number;
}
