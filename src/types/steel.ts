// 废钢价格表
export interface ScrapSteelPrice {
  id: number;
  company: string;
  material_type: string;
  price?: number;
  price_date: string;
  source_url?: string;
  news_title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateScrapSteelPriceRequest {
  company: string;
  material_type: string;
  price?: number;
  price_date: string;
  source_url?: string;
  news_title?: string;
}

export interface UpdateScrapSteelPriceRequest {
  company?: string;
  material_type?: string;
  price?: number;
  price_date?: string;
  source_url?: string;
  news_title?: string;
}

// 废钢价格变动记录表
export interface ScrapPriceChange {
  id: number;
  company: string;
  change_type: string;
  material_type: string;
  old_price?: number;
  new_price: number;
  change_amount?: number;
  news_date: string;
  news_title?: string;
  crawl_time?: string;
}

export interface CreateScrapPriceChangeRequest {
  company: string;
  change_type: string;
  material_type: string;
  old_price?: number;
  new_price: number;
  change_amount?: number;
  news_date: string;
  news_title?: string;
}

export interface UpdateScrapPriceChangeRequest {
  company?: string;
  change_type?: string;
  material_type?: string;
  old_price?: number;
  new_price?: number;
  change_amount?: number;
  news_date?: string;
  news_title?: string;
}

// 废钢调价公告表
export interface ScrapPriceAdjustment {
  id: number;
  company: string;
  material_keyword: string;
  adjustment_type: string;
  adjustment_amount: number;
  matched_material?: string;
  snapshot_price?: number;
  inferred_price?: number;
  news_date: string;
  news_title?: string;
  crawl_time?: string;
}

export interface CreateScrapPriceAdjustmentRequest {
  company: string;
  material_keyword: string;
  adjustment_type: string;
  adjustment_amount: number;
  matched_material?: string;
  snapshot_price?: number;
  inferred_price?: number;
  news_date: string;
  news_title?: string;
}

export interface UpdateScrapPriceAdjustmentRequest {
  company?: string;
  material_keyword?: string;
  adjustment_type?: string;
  adjustment_amount?: number;
  matched_material?: string;
  snapshot_price?: number;
  inferred_price?: number;
  news_date?: string;
  news_title?: string;
}

// 钢铁行情价格统一表
export interface SteelMarketPrice {
  id: number;
  category: string;
  area: string;
  product_name: string;
  specification: string;
  material?: string;
  quote_type?: string;
  price?: number;
  avg_price?: number;
  price_change?: string;
  unit?: string;
  price_date: string;
  crawl_date: string;
  crawl_time?: string;
}

export interface CreateSteelMarketPriceRequest {
  category: string;
  area: string;
  product_name: string;
  specification: string;
  material?: string;
  quote_type?: string;
  price?: number;
  avg_price?: number;
  price_change?: string;
  unit?: string;
  price_date: string;
  crawl_date: string;
}

export interface UpdateSteelMarketPriceRequest {
  category?: string;
  area?: string;
  product_name?: string;
  specification?: string;
  material?: string;
  quote_type?: string;
  price?: number;
  avg_price?: number;
  price_change?: string;
  unit?: string;
  price_date?: string;
  crawl_date?: string;
}

// 分页结果类型
export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

// 类型实例
export const PageResult = {} as PageResult<unknown>;
export const ScrapSteelPrice = {} as ScrapSteelPrice;
export const CreateScrapSteelPriceRequest = {} as CreateScrapSteelPriceRequest;
export const UpdateScrapSteelPriceRequest = {} as UpdateScrapSteelPriceRequest;
export const ScrapPriceChange = {} as ScrapPriceChange;
export const CreateScrapPriceChangeRequest = {} as CreateScrapPriceChangeRequest;
export const UpdateScrapPriceChangeRequest = {} as UpdateScrapPriceChangeRequest;
export const ScrapPriceAdjustment = {} as ScrapPriceAdjustment;
export const CreateScrapPriceAdjustmentRequest = {} as CreateScrapPriceAdjustmentRequest;
export const UpdateScrapPriceAdjustmentRequest = {} as UpdateScrapPriceAdjustmentRequest;
export const SteelMarketPrice = {} as SteelMarketPrice;
export const CreateSteelMarketPriceRequest = {} as CreateSteelMarketPriceRequest;
export const UpdateSteelMarketPriceRequest = {} as UpdateSteelMarketPriceRequest;
