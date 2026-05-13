import request from '../utils/request';
import type {
  ScrapSteelPrice,
  CreateScrapSteelPriceRequest,
  UpdateScrapSteelPriceRequest,
  ScrapPriceChange,
  CreateScrapPriceChangeRequest,
  UpdateScrapPriceChangeRequest,
  ScrapPriceAdjustment,
  CreateScrapPriceAdjustmentRequest,
  UpdateScrapPriceAdjustmentRequest,
  SteelMarketPrice,
  CreateSteelMarketPriceRequest,
  UpdateSteelMarketPriceRequest,
  PageResult,
} from '../types/steel';

// 废钢价格API
const scrapSteelPriceApi = {
  list: (params?: { page?: number; size?: number; company?: string; material_type?: string; start_date?: string; end_date?: string }) =>
    request.get<PageResult<ScrapSteelPrice>>('/api/scrap-steel-prices/list', params),

  getByCompany: (company: string) =>
    request.get<ScrapSteelPrice[]>(`/api/scrap-steel-prices/company/${company}`),

  getByDateRange: (params: { start_date: string; end_date: string; company?: string }) =>
    request.get<ScrapSteelPrice[]>('/api/scrap-steel-prices/date-range', params),

  getById: (id: number) =>
    request.get<ScrapSteelPrice>(`/api/scrap-steel-prices/${id}`),

  create: (data: CreateScrapSteelPriceRequest) =>
    request.post<ScrapSteelPrice>('/api/scrap-steel-prices', data),

  update: (id: number, data: UpdateScrapSteelPriceRequest) =>
    request.put<ScrapSteelPrice>(`/api/scrap-steel-prices/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/scrap-steel-prices/${id}`),

  batchDelete: (ids: number[]) =>
    request.post('/api/scrap-steel-prices/batch-delete', { ids }),
};

// 废钢价格变动记录API
const scrapPriceChangeApi = {
  list: (params?: { page?: number; size?: number; company?: string; material_type?: string; start_news_date?: string; end_news_date?: string }) =>
    request.get<PageResult<ScrapPriceChange>>('/api/scrap-price-changes/list', params),

  getByCompany: (company: string) =>
    request.get<ScrapPriceChange[]>(`/api/scrap-price-changes/company/${company}`),

  getByDateRange: (params: { start_news_date: string; end_news_date: string; company?: string }) =>
    request.get<ScrapPriceChange[]>('/api/scrap-price-changes/date-range', params),

  getById: (id: number) =>
    request.get<ScrapPriceChange>(`/api/scrap-price-changes/${id}`),

  create: (data: CreateScrapPriceChangeRequest) =>
    request.post<ScrapPriceChange>('/api/scrap-price-changes', data),

  update: (id: number, data: UpdateScrapPriceChangeRequest) =>
    request.put<ScrapPriceChange>(`/api/scrap-price-changes/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/scrap-price-changes/${id}`),

  batchDelete: (ids: number[]) =>
    request.post('/api/scrap-price-changes/batch-delete', { ids }),
};

// 废钢调价公告API
const scrapPriceAdjustmentApi = {
  list: (params?: { page?: number; size?: number; company?: string; material_keyword?: string; start_news_date?: string; end_news_date?: string }) =>
    request.get<PageResult<ScrapPriceAdjustment>>('/api/scrap-price-adjustments/list', params),

  getByCompany: (company: string) =>
    request.get<ScrapPriceAdjustment[]>(`/api/scrap-price-adjustments/company/${company}`),

  getByDateRange: (params: { start_news_date: string; end_news_date: string; company?: string }) =>
    request.get<ScrapPriceAdjustment[]>('/api/scrap-price-adjustments/date-range', params),

  getById: (id: number) =>
    request.get<ScrapPriceAdjustment>(`/api/scrap-price-adjustments/${id}`),

  create: (data: CreateScrapPriceAdjustmentRequest) =>
    request.post<ScrapPriceAdjustment>('/api/scrap-price-adjustments', data),

  update: (id: number, data: UpdateScrapPriceAdjustmentRequest) =>
    request.put<ScrapPriceAdjustment>(`/api/scrap-price-adjustments/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/scrap-price-adjustments/${id}`),

  batchDelete: (ids: number[]) =>
    request.post('/api/scrap-price-adjustments/batch-delete', { ids }),
};

// 钢铁行情价格API
const steelMarketPriceApi = {
  list: (params?: { page?: number; size?: number; category?: string; area?: string; product_name?: string; start_price_date?: string; end_price_date?: string }) =>
    request.get<PageResult<SteelMarketPrice>>('/api/steel-market-prices/list', params),

  getByCompany: (company: string) =>
    request.get<SteelMarketPrice[]>(`/api/steel-market-prices/company/${company}`),

  getByDateRange: (params: { start_price_date: string; end_price_date: string; category?: string; area?: string }) =>
    request.get<SteelMarketPrice[]>('/api/steel-market-prices/date-range', params),

  getById: (id: number) =>
    request.get<SteelMarketPrice>(`/api/steel-market-prices/${id}`),

  create: (data: CreateSteelMarketPriceRequest) =>
    request.post<SteelMarketPrice>('/api/steel-market-prices', data),

  update: (id: number, data: UpdateSteelMarketPriceRequest) =>
    request.put<SteelMarketPrice>(`/api/steel-market-prices/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/steel-market-prices/${id}`),

  batchDelete: (ids: number[]) =>
    request.post('/api/steel-market-prices/batch-delete', { ids }),
};

export const steelApi = {
  scrapSteelPrice: scrapSteelPriceApi,
  scrapPriceChange: scrapPriceChangeApi,
  scrapPriceAdjustment: scrapPriceAdjustmentApi,
  steelMarketPrice: steelMarketPriceApi,
};

export default steelApi;
