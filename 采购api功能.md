## **一、采购订单主表 `procurement_order`**

sql

```
DROP TABLE IF EXISTS procurement_order;

CREATE TABLE procurement_order (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL COMMENT '订单编号',
    order_date DATE NOT NULL COMMENT '订货日期',
    required_delivery_date DATE COMMENT '要求交付日期',
    orderer VARCHAR(50) COMMENT '订货人',
    supplier_code VARCHAR(50) COMMENT '供应商编号',
    supplier_name VARCHAR(100) COMMENT '供应商名称',
    supplier_nature VARCHAR(20) COMMENT '性质：个人/公司',
    material_code VARCHAR(50) COMMENT '物料编码',
    material_name VARCHAR(100) COMMENT '物料名称',
    delivery_method VARCHAR(20) COMMENT '交付方式：自提/送到',
    settlement_method VARCHAR(50) COMMENT '结算方式：未税反向/含税公/含税现汇',
    order_qty DECIMAL(12,3) DEFAULT 0 COMMENT '订货量（吨）',
    unit_price DECIMAL(12,2) DEFAULT 0 COMMENT '结算单价（元/吨）',
    order_amount DECIMAL(15,2) DEFAULT 0 COMMENT '订货金额（元）',
    delivered_qty DECIMAL(12,3) DEFAULT 0 COMMENT '已交付吨位',
    remaining_qty DECIMAL(12,3) DEFAULT 0 COMMENT '剩余吨位',
    order_status VARCHAR(20) DEFAULT '进行中' COMMENT '订单状态：进行中/已关闭/已完成',
    close_date DATE COMMENT '关闭日期',
    created_by VARCHAR(50) COMMENT '创建人',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_order_date (order_date),
    INDEX idx_supplier (supplier_name),
    INDEX idx_material (material_name),
    INDEX idx_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采购订单主表';
```

***

## **二、采购订单明细表 `procurement_order_detail`**

sql

```
DROP TABLE IF EXISTS procurement_order_detail;

CREATE TABLE procurement_order_detail (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '关联订单ID',
    order_no VARCHAR(50) COMMENT '订单编号（冗余）',
    
    -- 交付信息
    delivery_date DATE COMMENT '交付日期',
    upstream_supplier VARCHAR(100) COMMENT '上级供应商',
    downstream_company VARCHAR(100) COMMENT '下游公司',
    vehicle_no VARCHAR(50) COMMENT '车号',
    
    -- 重量信息
    gross_weight DECIMAL(12,3) DEFAULT 0 COMMENT '毛重',
    tare_weight DECIMAL(12,3) DEFAULT 0 COMMENT '皮重',
    net_weight DECIMAL(12,3) DEFAULT 0 COMMENT '净重',
    deduct_weight DECIMAL(12,3) DEFAULT 0 COMMENT '扣重',
    settlement_qty DECIMAL(12,3) DEFAULT 0 COMMENT '结算吨位',
    settlement_amount DECIMAL(15,2) DEFAULT 0 COMMENT '结算金额',
    
    -- 过磅信息
    weighbridge_no VARCHAR(50) COMMENT '过磅编号',
    weigh_date DATE COMMENT '过磅日期',
    weigh_location VARCHAR(100) COMMENT '过磅位置',
    weigher VARCHAR(50) COMMENT '过磅员',
    
    -- 仓库确认
    is_delivered TINYINT DEFAULT 0 COMMENT '是否送到：0-否，1-是',
    warehouse_in_qty DECIMAL(12,3) DEFAULT 0 COMMENT '入库（销售）吨位',
    impurity_deduction DECIMAL(12,3) DEFAULT 0 COMMENT '扣杂',
    total_arrival_qty DECIMAL(12,3) DEFAULT 0 COMMENT '合计到货吨位',
    weighbridge_diff DECIMAL(12,3) DEFAULT 0 COMMENT '磅差',
    
    -- 审计字段
    filler VARCHAR(50) COMMENT '填表人',
    remark TEXT COMMENT '备注',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order_id (order_id),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_vehicle (vehicle_no),
    FOREIGN KEY (order_id) REFERENCES procurement_order(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采购订单交付明细表';
```

***

## **三、车辆需求表 `vehicle_demand`**

sql

```
DROP TABLE IF EXISTS vehicle_demand;

CREATE TABLE vehicle_demand (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    plan_date DATE COMMENT '计划日期',
    request_date DATE COMMENT '要车日期',
    material_name VARCHAR(100) COMMENT '所装物料',
    vehicle_type VARCHAR(20) COMMENT '需求类型：高栏/低栏',
    supplier_name VARCHAR(100) COMMENT '装货供应商',
    origin VARCHAR(100) COMMENT '始发地',
    destination VARCHAR(100) COMMENT '目的地',
    vehicle_count INT DEFAULT 0 COMMENT '数量（辆）',
    requester VARCHAR(50) COMMENT '需求人',
    special_remark VARCHAR(500) COMMENT '特殊备注',
    is_confirmed TINYINT DEFAULT 0 COMMENT '确认状态：0-未确认，1-已确认',
    order_id BIGINT COMMENT '关联订单ID',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_plan_date (plan_date),
    INDEX idx_origin_dest (origin, destination),
    INDEX idx_supplier (supplier_name),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆需求表';
```

***

## **四、付款申请表 `payment_application`**

sql

```
DROP TABLE IF EXISTS payment_application;

CREATE TABLE payment_application (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    application_no VARCHAR(50) NOT NULL COMMENT '申请编号',
    initiated_at DATETIME COMMENT '发起时间',
    initiator VARCHAR(50) COMMENT '发起人',
    payer_unit VARCHAR(100) COMMENT '付款单位',
    payment_type VARCHAR(50) COMMENT '付款类型',
    payment_reason VARCHAR(500) COMMENT '付款事由',
    payment_method VARCHAR(20) COMMENT '付款方式：现汇/银承等',
    payment_amount DECIMAL(15,2) DEFAULT 0 COMMENT '付款总额（元）',
    payee_name VARCHAR(200) COMMENT '收款单位',
    payee_account VARCHAR(100) COMMENT '收款账号',
    approval_status VARCHAR(20) DEFAULT '未审批' COMMENT '审批状态：未审批/已审批',
    related_order_qty DECIMAL(12,3) DEFAULT 0 COMMENT '关联订货量（吨）',
    order_id BIGINT COMMENT '关联订单ID',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_application_no (application_no),
    INDEX idx_initiated_at (initiated_at),
    INDEX idx_payer (payer_unit),
    INDEX idx_payee (payee_name),
    INDEX idx_approval_status (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='付款申请表';
```

***

## **五、供应商信息表 `supplier_info`**

sql

```
DROP TABLE IF EXISTS supplier_info;

CREATE TABLE supplier_info (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(50) NOT NULL COMMENT '供应商编码',
    supplier_type VARCHAR(50) COMMENT '类型：壳子铸件类/综合类/有色类',
    province VARCHAR(50) COMMENT '供应商地址(省)',
    city VARCHAR(50) COMMENT '供应商地址(市)',
    nature VARCHAR(20) COMMENT '性质：个人/公司',
    full_name VARCHAR(200) COMMENT '全称',
    short_name VARCHAR(100) COMMENT '简称',
    supply_material VARCHAR(200) COMMENT '供应料型',
    cooperation_status VARCHAR(20) DEFAULT '合作中' COMMENT '合作状态：合作中/暂停/备选',
    contact_person VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(50) COMMENT '联系方式',
    updated_date DATE COMMENT '更新日期',
    owner VARCHAR(50) COMMENT '对接人',
    deleted TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_supplier_code (supplier_code),
    INDEX idx_province (province),
    INDEX idx_nature (nature),
    INDEX idx_status (cooperation_status),
    INDEX idx_owner (owner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商信息表';
```

***

## **六、建表执行顺序**

sql

```
-- 1. 供应商信息表
-- 2. 采购订单主表
-- 3. 采购订单明细表
-- 4. 车辆需求表
-- 5. 付款申请表
```

***

## **七、表关系图**

text

```
┌─────────────────────────────────────────────────────────────┐
│                    supplier_info                            │
│              (供应商信息表)                                  │
│  supplier_code, full_name, short_name, province, nature     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  procurement_order                          │
│              (采购订单主表)                                  │
│  order_no, supplier_name, material_name, order_qty, ...     │
└───────────────┬─────────────────┬───────────────────────────┘
                │                 │
                │ 1:N              │ 1:N
                ▼                 ▼
┌───────────────────────────┐ ┌───────────────────────────────┐
│  procurement_order_detail │ │       vehicle_demand          │
│    (采购订单明细表)        │ │        (车辆需求表)            │
│  delivery_date, vehicle_no│ │  request_date, origin, dest   │
│  gross_weight, net_weight │ │  vehicle_count, material_name │
└───────────────────────────┘ └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 payment_application                         │
│                   (付款申请表)                               │
│  application_no, payer_unit, payee_name, payment_amount     │
│  approval_status                                            │
└─────────────────────────────────────────────────────────────┘
```

\
API接口列表

### 采购订单 (ProcurementOrder)

方法 路径 说明 POST /api/procurement-order 创建采购订单 GET /api/procurement-order/{id} 根据ID获取 GET /api/procurement-order/list 获取所有订单 GET /api/procurement-order/order-no/{orderNo} 根据订单编号查询 GET /api/procurement-order/supplier/{supplierName} 根据供应商查询 GET /api/procurement-order/material/{materialName} 根据物料查询 GET /api/procurement-order/status/{orderStatus} 根据状态查询 PUT /api/procurement-order/{id} 更新订单 DELETE /api/procurement-order/{id} 删除订单 POST /api/procurement-order/close/{id} 关闭订单 POST /api/procurement-order/complete/{id} 完成交付

### 采购订单明细 (ProcurementOrderDetail)

方法 路径 说明 POST /api/procurement-order-detail 创建明细 GET /api/procurement-order-detail/{id} 获取明细 GET /api/procurement-order-detail/order/{orderId} 根据订单ID查询 GET /api/procurement-order-detail/vehicle/{vehicleNo} 根据车号查询 GET /api/procurement-order-detail/delivery-date/{date} 根据交付日期查询 PUT /api/procurement-order-detail/{id} 更新明细 DELETE /api/procurement-order-detail/{id} 删除明细 POST /api/procurement-order-detail/confirm-delivery/{id} 确认交付

### 车辆需求 (VehicleDemand)

方法 路径 说明 POST /api/vehicle-demand 创建需求 GET /api/vehicle-demand/{id} 获取需求 GET /api/vehicle-demand/plan-date/{date} 根据计划日期查询 GET /api/vehicle-demand/supplier/{name} 根据供应商查询 GET /api/vehicle-demand/confirmed/{status} 根据确认状态查询 PUT /api/vehicle-demand/{id} 更新需求 DELETE /api/vehicle-demand/{id} 删除需求 POST /api/vehicle-demand/confirm/{id} 确认需求

### 付款申请 (PaymentApplication)

方法 路径 说明 POST /api/payment-application 创建申请 GET /api/payment-application/{id} 获取申请 GET /api/payment-application/status/{status} 根据审批状态查询 GET /api/payment-application/date-range 根据时间区间查询 PUT /api/payment-application/{id} 更新申请 DELETE /api/payment-application/{id} 删除申请 POST /api/payment-application/approve/{id} 审批通过 POST /api/payment-application/reject/{id} 审批拒绝

### 供应商信息 (SupplierInfo)

方法 路径 说明 POST /api/supplier-info 创建供应商 GET /api/supplier-info/{id} 获取供应商 GET /api/supplier-info/code/{code} 根据编码查询 GET /api/supplier-info/province/{province} 根据省份查询 GET /api/supplier-info/status/{status} 根据合作状态查询 GET /api/supplier-info/fullname/{name} 根据全称模糊查询 PUT /api/supplier-info/{id} 更新供应商 DELETE /api/supplier-info/{id} 删除供应商 POST /api/supplier-info/suspend/{id} 暂停合作 POST /api/supplier-info/activate/{id} 激活合作

<br />

supplier\_info (供应商)
↓
procurement\_order (采购订单主表)
↓ (1:N)
procurement\_order\_detail (采购订单明细) ←→ vehicle\_demand (车辆需求)

procurement\_order (采购订单主表)
↓ (1:N)\
payment\_application (付款申请表)
