import type { FinancialData } from '../types';

// 模拟财务数据
export const mockFinancialData: FinancialData = {
  total: 3971.7,
  cashBalance: 1487.89,
  bankBalance: 1585.04,
  otherBalance: 898.77,
  dailyUsagePlan: [
    { date: '2026-03-22', amount: 150 },
    { date: '2026-03-23', amount: 180 },
    { date: '2026-03-24', amount: 200 },
    { date: '2026-03-25', amount: 160 },
    { date: '2026-03-26', amount: 190 },
  ],
  supplierFundingPlan: [
    { supplier: '大胜制衣', plan: { cash: 1.75, bank: 1.75, other: 0 } },
    { supplier: '湖北老广', plan: { cash: 0.57, bank: 1.75, other: 0 } },
    { supplier: '常熟面料', plan: { cash: 0.57, bank: 1.75, other: 0 } },
    { supplier: '杭州阿好坊', plan: { cash: 0, bank: 1.75, other: 0 } },
    { supplier: '常熟彩源', plan: { cash: 0, bank: 1.75, other: 0 } },
    { supplier: '天顺祥', plan: { cash: 0, bank: 2.75, other: 0 } },
    { supplier: '田野针织', plan: { cash: 0.52, bank: 1.75, other: 0 } },
    { supplier: '锦帛中泰', plan: { cash: 0.52, bank: 1.75, other: 0 } },
  ],
  receivables: [
    { category: '苏美', currentTotal: 4592.27, historicalTotal: 3145941.63 },
    { category: '精觉', currentTotal: 116095.54, historicalTotal: 171548419.86 },
    { category: '圣希雅', currentTotal: 1377.78, historicalTotal: 0 },
    { category: '蓝冰', currentTotal: 321485.75, historicalTotal: 0 },
    { category: '重工', currentTotal: 28713265.48, historicalTotal: 0 },
  ],
  collectionDetails: [
    { type: '商业承兑', amount: 65.09, percentage: 99 },
    { type: '现金', amount: 2.41, percentage: 2.1 },
    { type: '银行承兑', amount: 0.7, percentage: 0.7 },
  ],
  totalReceivables: 4485.73,
  receivablesByCategory: [
    { category: '服装', amount: 1123.3, percentage: 24.42 },
    { category: '里料', amount: 625.29, percentage: 13.95 },
    { category: '卡丰', amount: 2884.59, percentage: 62.06 },
  ],
};
