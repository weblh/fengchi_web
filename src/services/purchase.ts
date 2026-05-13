import request from '../utils/request';
import type {
  ProcurementOrder,
  CreateProcurementOrderRequest,
  UpdateProcurementOrderRequest,
  ProcurementOrderDetail,
  CreateProcurementOrderDetailRequest,
  UpdateProcurementOrderDetailRequest,
  VehicleDemand,
  CreateVehicleDemandRequest,
  UpdateVehicleDemandRequest,
  PaymentApplication,
  CreatePaymentApplicationRequest,
  UpdatePaymentApplicationRequest,
  SupplierInfo,
  CreateSupplierInfoRequest,
  UpdateSupplierInfoRequest,
  PageResult,
} from '../types/purchase';

const procurementOrderApi = {
  create: (data: CreateProcurementOrderRequest) =>
    request.post<ProcurementOrder>('/api/procurement-order', data),

  getById: (id: number) =>
    request.get<ProcurementOrder>(`/api/procurement-order/${id}`),

  getAll: (params?: { page?: number; size?: number }) =>
    request.get<PageResult<ProcurementOrder>>('/api/procurement-order/list', params),

  search: (params: {
    page?: number;
    size?: number;
    orderNo?: string;
    supplierName?: string;
    materialName?: string;
    orderStatus?: string;
  }) =>
    request.get<PageResult<ProcurementOrder>>('/api/procurement-order/search', params),

  getByOrderNo: (orderNo: string) =>
    request.get<ProcurementOrder>(`/api/procurement-order/order-no/${orderNo}`),

  getBySupplier: (supplierName: string) =>
    request.get<ProcurementOrder[]>(`/api/procurement-order/supplier/${supplierName}`),

  getByMaterial: (materialName: string) =>
    request.get<ProcurementOrder[]>(`/api/procurement-order/material/${materialName}`),

  getByStatus: (orderStatus: string) =>
    request.get<ProcurementOrder[]>(`/api/procurement-order/status/${orderStatus}`),

  update: (id: number, data: UpdateProcurementOrderRequest) =>
    request.put<ProcurementOrder>(`/api/procurement-order/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/procurement-order/${id}`),

  close: (id: number) =>
    request.post<ProcurementOrder>(`/api/procurement-order/close/${id}`),

  complete: (id: number) =>
    request.post<ProcurementOrder>(`/api/procurement-order/complete/${id}`),
};

const procurementOrderDetailApi = {
  create: (data: CreateProcurementOrderDetailRequest) =>
    request.post<ProcurementOrderDetail>('/api/procurement-order-detail', data),

  getById: (id: number) =>
    request.get<ProcurementOrderDetail>(`/api/procurement-order-detail/${id}`),

  search: (params: {
    page?: number;
    size?: number;
    orderId?: number;
    vehicleNo?: string;
    deliveryDate?: string;
  }) =>
    request.get('/api/procurement-order-detail/search', params),

  getByOrderId: (orderId: number) =>
    request.get<ProcurementOrderDetail[]>(`/api/procurement-order-detail/order/${orderId}`),

  getByVehicleNo: (vehicleNo: string) =>
    request.get<ProcurementOrderDetail[]>(`/api/procurement-order-detail/vehicle/${vehicleNo}`),

  getByDeliveryDate: (date: string) =>
    request.get<ProcurementOrderDetail[]>(`/api/procurement-order-detail/delivery-date/${date}`),

  update: (id: number, data: UpdateProcurementOrderDetailRequest) =>
    request.put<ProcurementOrderDetail>(`/api/procurement-order-detail/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/procurement-order-detail/${id}`),

  confirmDelivery: (id: number) =>
    request.post<ProcurementOrderDetail>(`/api/procurement-order-detail/confirm-delivery/${id}`),
};

const vehicleDemandApi = {
  create: (data: CreateVehicleDemandRequest) =>
    request.post<VehicleDemand>('/api/vehicle-demand', data),

  getById: (id: number) =>
    request.get<VehicleDemand>(`/api/vehicle-demand/${id}`),

  getByPlanDate: (date: string) =>
    request.get<VehicleDemand[]>(`/api/vehicle-demand/plan-date/${date}`),

  getBySupplier: (name: string) =>
    request.get<VehicleDemand[]>(`/api/vehicle-demand/supplier/${name}`),

  getByConfirmed: (status: number) =>
    request.get<VehicleDemand[]>(`/api/vehicle-demand/confirmed/${status}`),

  search: (params: {
    page?: number;
    size?: number;
    planDate?: string;
    supplierName?: string;
    isConfirmed?: string;
  }) =>
    request.get<PageResult<VehicleDemand>>('/api/vehicle-demand/search', params),

  update: (id: number, data: UpdateVehicleDemandRequest) =>
    request.put<VehicleDemand>(`/api/vehicle-demand/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/vehicle-demand/${id}`),

  confirm: (id: number) =>
    request.post<VehicleDemand>(`/api/vehicle-demand/confirm/${id}`),
};

const paymentApplicationApi = {
  create: (data: CreatePaymentApplicationRequest) =>
    request.post<PaymentApplication>('/api/payment-application', data),

  getById: (id: number) =>
    request.get<PaymentApplication>(`/api/payment-application/${id}`),

  search: (params: {
    page?: number;
    size?: number;
    approvalStatus?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    request.get('/api/payment-application/list', params),

  getByStatus: (status: string) =>
    request.get<PaymentApplication[]>(`/api/payment-application/status/${status}`),

  getByDateRange: (params: { startDate: string; endDate: string }) =>
    request.get<PaymentApplication[]>('/api/payment-application/date-range', params),

  update: (id: number, data: UpdatePaymentApplicationRequest) =>
    request.put<PaymentApplication>(`/api/payment-application/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/payment-application/${id}`),

  approve: (id: number) =>
    request.post<PaymentApplication>(`/api/payment-application/approve/${id}`),

  reject: (id: number) =>
    request.post<PaymentApplication>(`/api/payment-application/reject/${id}`),
};

const supplierInfoApi = {
  create: (data: CreateSupplierInfoRequest) =>
    request.post<SupplierInfo>('/api/supplier-info', data),

  getById: (id: number) =>
    request.get<SupplierInfo>(`/api/supplier-info/${id}`),

  getByCode: (code: string) =>
    request.get<SupplierInfo>(`/api/supplier-info/code/${code}`),

  getByProvince: (province: string) =>
    request.get<SupplierInfo[]>(`/api/supplier-info/province/${province}`),

  getByStatus: (status: string) =>
    request.get<SupplierInfo[]>(`/api/supplier-info/status/${status}`),

  getByFullName: (name: string) =>
    request.get<SupplierInfo[]>(`/api/supplier-info/fullname/${name}`),

  search: (params: {
    page?: number;
    size?: number;
    supplierCode?: string;
    province?: string;
    cooperationStatus?: string;
    fullName?: string;
  }) =>
    request.get<PageResult<SupplierInfo>>('/api/supplier-info/search', params),

  update: (id: number, data: UpdateSupplierInfoRequest) =>
    request.put<SupplierInfo>(`/api/supplier-info/${id}`, data),

  delete: (id: number) =>
    request.delete(`/api/supplier-info/${id}`),

  suspend: (id: number) =>
    request.post<SupplierInfo>(`/api/supplier-info/suspend/${id}`),

  activate: (id: number) =>
    request.post<SupplierInfo>(`/api/supplier-info/activate/${id}`),
};

export const purchaseApi = {
  procurementOrder: procurementOrderApi,
  procurementOrderDetail: procurementOrderDetailApi,
  vehicleDemand: vehicleDemandApi,
  paymentApplication: paymentApplicationApi,
  supplierInfo: supplierInfoApi,
};

export default purchaseApi;