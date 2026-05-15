# 丰驰管理系统 API 接口文档

## 概述

本文档整理了丰驰管理系统所有可用的 API 接口，供 AI 助手参考和调用。

---

## 1. AI 智能助手

### 1.1 AI 聊天

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ai/chat` | AI 对话接口 |

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| msg | string | 是 | 用户消息内容 |
| model | string | 否 | 模型选择：deepseek（默认）、qwen |

**响应示例：**
```json
{
  "code": 200,
  "message": "AI 回复内容",
  "data": null,
  "timestamp": 1778722612965
}
```

---

## 2. 认证模块

### 2.1 用户登录

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |

**请求参数：**
```json
{
  "username": "用户名",
  "password": "密码",
  "deviceId": "设备ID"
}
```

### 2.2 退出登录

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/logout` | 用户退出登录 |

### 2.3 发送验证码

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/send-verification-code` | 发送设备验证码 |

**请求参数：**
```json
{
  "username": "用户名"
}
```

### 2.4 验证设备

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/verify-device` | 验证新设备 |

**请求参数：**
```json
{
  "username": "用户名",
  "code": "验证码"
}
```

---

## 3. 菜单模块

### 3.1 获取用户路由菜单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/menus/routes` | 获取当前用户的路由菜单 |

---

## 4. 采购管理模块

### 4.1 采购订单

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/procurement-order` | 创建采购订单 |
| GET | `/api/procurement-order/{id}` | 根据ID获取订单详情 |
| GET | `/api/procurement-order/list` | 获取订单列表（分页） |
| GET | `/api/procurement-order/search` | 搜索订单 |
| GET | `/api/procurement-order/order-no/{orderNo}` | 根据订单号获取 |
| PUT | `/api/procurement-order/{id}` | 更新订单 |
| DELETE | `/api/procurement-order/{id}` | 删除订单 |
| POST | `/api/procurement-order/close/{id}` | 关闭订单 |
| POST | `/api/procurement-order/complete/{id}` | 完成订单 |

### 4.2 采购订单明细

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/procurement-order-detail` | 创建订单明细 |
| GET | `/api/procurement-order-detail/search` | 搜索订单明细 |
| POST | `/api/procurement-order-detail/confirm-delivery/{id}` | 确认交货 |

### 4.3 车辆需求

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/vehicle-demand` | 创建车辆需求 |
| GET | `/api/vehicle-demand/search` | 搜索车辆需求 |
| POST | `/api/vehicle-demand/confirm/{id}` | 确认车辆需求 |

### 4.4 付款申请

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/payment-application` | 创建付款申请 |
| GET | `/api/payment-application/list` | 获取付款申请列表 |
| POST | `/api/payment-application/approve/{id}` | 批准付款申请 |
| POST | `/api/payment-application/reject/{id}` | 拒绝付款申请 |

### 4.5 供应商信息

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/supplier-info` | 创建供应商 |
| GET | `/api/supplier-info/search` | 搜索供应商 |
| POST | `/api/supplier-info/suspend/{id}` | 暂停合作 |
| POST | `/api/supplier-info/activate/{id}` | 激活合作 |

---

## 5. 钢铁价格模块

### 5.1 废钢价格

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/scrap-steel-prices/list` | 获取价格列表（分页） |
| GET | `/api/scrap-steel-prices/company/{company}` | 根据公司获取 |
| POST | `/api/scrap-steel-prices` | 创建价格记录 |
| PUT | `/api/scrap-steel-prices/{id}` | 更新价格记录 |
| DELETE | `/api/scrap-steel-prices/{id}` | 删除价格记录 |
| POST | `/api/scrap-steel-prices/batch-delete` | 批量删除 |

### 5.2 废钢价格变动

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/scrap-price-changes/list` | 获取变动列表（分页） |

### 5.3 废钢调价公告

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/scrap-price-adjustments/list` | 获取公告列表（分页） |

### 5.4 钢铁市场行情

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/steel-market-prices/list` | 获取行情列表（分页） |

---

## 6. 财务模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/daily-payment-plan/list` | 获取每日资金计划列表 |
| GET | `/api/daily-payment-plan/list` | 获取付款计划列表 |
---

## 7. 销售模块

### 7.1 订单管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/orders/list` | 获取销售订单列表 |
| GET | `/orders/{id}` | 获取订单详情 |
| POST | `/orders/create` | 创建销售订单 |
| PUT | `/orders/{id}` | 更新销售订单 |
| DELETE | `/orders/{id}` | 删除销售订单 |
| GET | `/order-detail/order/{orderId}` | 获取订单明细 |
| DELETE | `/order-detail/{id}` | 删除订单明细 |
| GET | `/api/orders/export` | 导出订单（GET请求） |
| POST | `/api/orders/import` | 导入订单 |
| GET | `/api/order-detail/receipt-weighing` | 获取收货过磅大宗数据 |
| POST | `/api/order-detail/sync-selected` | 同步选中的大宗数据到订单明细 |

### 7.2 销售计划

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/sales-plan/list` | 获取销售计划列表 |

---

## 通用说明

### 分页参数
所有列表接口支持以下分页参数：
- `page`: 页码（从1开始）
- `size`: 每页数量

### 通用响应格式
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1778722612965
}
```

### 认证说明
所有接口（除登录相关）需要在请求头中携带 Token：
```
Authorization: Bearer {token}
```
