export interface ProcurementOrder {
  id: number;
  orderNo: string;
  orderDate: string;
  requiredDeliveryDate: string;
  orderer: string;
  supplierCode: string;
  supplierName: string;
  supplierNature: string;
  materialCode: string;
  materialName: string;
  deliveryMethod: string;
  settlementMethod: string;
  orderQty: number;
  unitPrice: number;
  orderAmount: number;
  deliveredQty: number;
  remainingQty: number;
  orderStatus: string;
  closeDate: string;
  createdBy: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

export interface CreateProcurementOrderRequest {
  orderNo: string;
  orderDate: string;
  requiredDeliveryDate?: string;
  orderer?: string;
  supplierCode?: string;
  supplierName?: string;
  supplierNature?: string;
  materialCode?: string;
  materialName?: string;
  deliveryMethod?: string;
  settlementMethod?: string;
  orderQty: number;
  unitPrice: number;
  orderAmount: number;
  createdBy?: string;
}

export interface UpdateProcurementOrderRequest {
  orderNo?: string;
  orderDate?: string;
  requiredDeliveryDate?: string;
  orderer?: string;
  supplierCode?: string;
  supplierName?: string;
  supplierNature?: string;
  materialCode?: string;
  materialName?: string;
  deliveryMethod?: string;
  settlementMethod?: string;
  orderQty?: number;
  unitPrice?: number;
  orderAmount?: number;
}

export interface ProcurementOrderDetail {
  id: number;
  orderId: number;
  orderNo: string;
  deliveryDate: string;
  upstreamSupplier: string;
  downstreamCompany: string;
  vehicleNo: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  deductWeight: number;
  settlementQty: number;
  settlementAmount: number;
  weighbridgeNo: string;
  weighDate: string;
  weighLocation: string;
  weigher: string;
  isDelivered: number;
  warehouseInQty: number;
  impurityDeduction: number;
  totalArrivalQty: number;
  weighbridgeDiff: number;
  filler: string;
  remark: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

export interface CreateProcurementOrderDetailRequest {
  orderId: number;
  orderNo?: string;
  deliveryDate?: string;
  upstreamSupplier?: string;
  downstreamCompany?: string;
  vehicleNo?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  deductWeight?: number;
  settlementQty?: number;
  settlementAmount?: number;
  weighbridgeNo?: string;
  weighDate?: string;
  weighLocation?: string;
  weigher?: string;
  filler?: string;
  remark?: string;
}

export interface UpdateProcurementOrderDetailRequest {
  deliveryDate?: string;
  upstreamSupplier?: string;
  downstreamCompany?: string;
  vehicleNo?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  deductWeight?: number;
  settlementQty?: number;
  settlementAmount?: number;
  weighbridgeNo?: string;
  weighDate?: string;
  weighLocation?: string;
  weigher?: string;
  isDelivered?: number;
  warehouseInQty?: number;
  impurityDeduction?: number;
  totalArrivalQty?: number;
  weighbridgeDiff?: number;
  filler?: string;
  remark?: string;
}

export interface VehicleDemand {
  id: number;
  planDate: string;
  requestDate: string;
  materialName: string;
  vehicleType: string;
  supplierName: string;
  origin: string;
  destination: string;
  vehicleCount: number;
  requester: string;
  specialRemark: string;
  isConfirmed: number;
  orderId: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

export interface CreateVehicleDemandRequest {
  planDate?: string;
  requestDate: string;
  materialName: string;
  vehicleType?: string;
  supplierName?: string;
  origin?: string;
  destination?: string;
  vehicleCount: number;
  requester?: string;
  specialRemark?: string;
  orderId?: number;
}

export interface UpdateVehicleDemandRequest {
  planDate?: string;
  requestDate?: string;
  materialName?: string;
  vehicleType?: string;
  supplierName?: string;
  origin?: string;
  destination?: string;
  vehicleCount?: number;
  requester?: string;
  specialRemark?: string;
  isConfirmed?: number;
  orderId?: number;
}

export interface PaymentApplication {
  id: number;
  applicationNo: string;
  initiatedAt: string;
  initiator: string;
  payerUnit: string;
  paymentType: string;
  paymentReason: string;
  paymentMethod: string;
  paymentAmount: number;
  payeeName: string;
  payeeAccount: string;
  approvalStatus: string;
  relatedOrderQty: number;
  orderId: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

export interface CreatePaymentApplicationRequest {
  applicationNo: string;
  initiatedAt?: string;
  initiator?: string;
  payerUnit?: string;
  paymentType?: string;
  paymentReason?: string;
  paymentMethod?: string;
  paymentAmount: number;
  payeeName?: string;
  payeeAccount?: string;
  relatedOrderQty?: number;
  orderId?: number;
}

export interface UpdatePaymentApplicationRequest {
  applicationNo?: string;
  initiatedAt?: string;
  initiator?: string;
  payerUnit?: string;
  paymentType?: string;
  paymentReason?: string;
  paymentMethod?: string;
  paymentAmount?: number;
  payeeName?: string;
  payeeAccount?: string;
  approvalStatus?: string;
  relatedOrderQty?: number;
  orderId?: number;
}

export interface SupplierInfo {
  id: number;
  supplierCode: string;
  supplierType: string;
  province: string;
  city: string;
  nature: string;
  fullName: string;
  shortName: string;
  supplyMaterial: string;
  cooperationStatus: string;
  contactPerson: string;
  contactPhone: string;
  updatedDate: string;
  owner: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

export interface CreateSupplierInfoRequest {
  supplierCode: string;
  supplierType?: string;
  province?: string;
  city?: string;
  nature?: string;
  fullName?: string;
  shortName?: string;
  supplyMaterial?: string;
  cooperationStatus?: string;
  contactPerson?: string;
  contactPhone?: string;
  updatedDate?: string;
  owner?: string;
}

export interface UpdateSupplierInfoRequest {
  supplierCode?: string;
  supplierType?: string;
  province?: string;
  city?: string;
  nature?: string;
  fullName?: string;
  shortName?: string;
  supplyMaterial?: string;
  cooperationStatus?: string;
  contactPerson?: string;
  contactPhone?: string;
  updatedDate?: string;
  owner?: string;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

export const PageResult = {} as PageResult<unknown>;
export const CreatePaymentApplicationRequest = {} as CreatePaymentApplicationRequest;
export const UpdatePaymentApplicationRequest = {} as UpdatePaymentApplicationRequest;
export const PaymentApplication = {} as PaymentApplication;
export const CreateVehicleDemandRequest = {} as CreateVehicleDemandRequest;
export const UpdateVehicleDemandRequest = {} as UpdateVehicleDemandRequest;
export const VehicleDemand = {} as VehicleDemand;
export const CreateProcurementOrderDetailRequest = {} as CreateProcurementOrderDetailRequest;
export const UpdateProcurementOrderDetailRequest = {} as UpdateProcurementOrderDetailRequest;
export const ProcurementOrderDetail = {} as ProcurementOrderDetail;
export const CreateProcurementOrderRequest = {} as CreateProcurementOrderRequest;
export const UpdateProcurementOrderRequest = {} as UpdateProcurementOrderRequest;
export const ProcurementOrder = {} as ProcurementOrder;
export const CreateSupplierInfoRequest = {} as CreateSupplierInfoRequest;
export const UpdateSupplierInfoRequest = {} as UpdateSupplierInfoRequest;
export const SupplierInfo = {} as SupplierInfo;
