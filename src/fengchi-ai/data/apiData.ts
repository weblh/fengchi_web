export interface ApiEndpoint {
  key: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: string[];
  queryParams?: string[];
  requestBody?: string;
  responseFields?: string[];
}

export interface ApiCategory {
  key: string;
  title: string;
  children: ApiEndpoint[];
}

export const apiData: ApiCategory[] = [
  {
    key: 'ai',
    title: 'AI 智能助手',
    children: [
      {
        key: 'ai-chat',
        title: 'AI 聊天',
        method: 'GET',
        path: '/api/ai/chat',
        description: 'AI 对话接口，支持 deepseek、deepseek-v4 和 qwen 模型',
        queryParams: ['msg: string (必填) - 用户消息内容', 'model: string - 模型选择：deepseek、deepseek-v4、qwen'],
        responseFields: ['message: string - AI 回复内容'],
      },
    ],
  },
  {
    key: 'auth',
    title: '认证模块',
    children: [
      {
        key: 'auth-login',
        title: '用户登录',
        method: 'POST',
        path: '/api/auth/login',
        description: '用户登录认证',
        requestBody: '{ username, password, deviceId }',
        responseFields: ['token: string - 认证令牌'],
      },
      {
        key: 'auth-logout',
        title: '退出登录',
        method: 'POST',
        path: '/api/auth/logout',
        description: '用户退出登录',
      },
      {
        key: 'auth-send-code',
        title: '发送验证码',
        method: 'POST',
        path: '/api/auth/send-verification-code',
        description: '发送设备验证码',
        requestBody: '{ username }',
      },
      {
        key: 'auth-verify-device',
        title: '验证设备',
        method: 'POST',
        path: '/api/auth/verify-device',
        description: '验证新设备',
        requestBody: '{ username, code }',
      },
    ],
  },
  {
    key: 'menu',
    title: '菜单模块',
    children: [
      {
        key: 'menu-routes',
        title: '获取用户菜单',
        method: 'GET',
        path: '/api/menus/routes',
        description: '获取当前用户的路由菜单',
      },
    ],
  },
  {
    key: 'procurement',
    title: '采购管理',
    children: [
      {
        key: 'procurement-order-create',
        title: '创建采购订单',
        method: 'POST',
        path: '/api/procurement-order',
        description: '创建新的采购订单',
        requestBody: '{ orderNo, orderDate, supplierName, materialName, orderQty, unitPrice, orderAmount }',
      },
      {
        key: 'procurement-order-get',
        title: '获取采购订单',
        method: 'GET',
        path: '/api/procurement-order/{id}',
        description: '根据ID获取采购订单详情',
        params: ['id: number - 订单ID'],
      },
      {
        key: 'procurement-order-list',
        title: '采购订单列表',
        method: 'GET',
        path: '/api/procurement-order/list',
        description: '获取采购订单列表（分页）',
        queryParams: ['page: number - 页码', 'size: number - 每页数量'],
      },
      {
        key: 'procurement-order-search',
        title: '搜索采购订单',
        method: 'GET',
        path: '/api/procurement-order/search',
        description: '按条件搜索采购订单',
        queryParams: ['page: number', 'size: number', 'orderNo: string', 'supplierName: string', 'materialName: string', 'orderStatus: string'],
      },
      {
        key: 'procurement-order-by-no',
        title: '按订单号查询',
        method: 'GET',
        path: '/api/procurement-order/order-no/{orderNo}',
        description: '根据订单号获取采购订单',
        params: ['orderNo: string'],
      },
      {
        key: 'procurement-order-update',
        title: '更新采购订单',
        method: 'PUT',
        path: '/api/procurement-order/{id}',
        description: '更新采购订单信息',
        params: ['id: number'],
      },
      {
        key: 'procurement-order-delete',
        title: '删除采购订单',
        method: 'DELETE',
        path: '/api/procurement-order/{id}',
        description: '删除采购订单',
        params: ['id: number'],
      },
      {
        key: 'procurement-order-close',
        title: '关闭采购订单',
        method: 'POST',
        path: '/api/procurement-order/close/{id}',
        description: '关闭采购订单',
        params: ['id: number'],
      },
      {
        key: 'procurement-order-complete',
        title: '完成采购订单',
        method: 'POST',
        path: '/api/procurement-order/complete/{id}',
        description: '标记采购订单为完成',
        params: ['id: number'],
      },
      {
        key: 'procurement-detail-search',
        title: '搜索订单明细',
        method: 'GET',
        path: '/api/procurement-order-detail/search',
        description: '搜索采购订单明细',
        queryParams: ['page: number', 'size: number', 'orderId: number', 'vehicleNo: string', 'deliveryDate: string'],
      },
      {
        key: 'procurement-detail-confirm',
        title: '确认交货',
        method: 'POST',
        path: '/api/procurement-order-detail/confirm-delivery/{id}',
        description: '确认采购订单明细已交货',
        params: ['id: number'],
      },
      {
        key: 'vehicle-demand-create',
        title: '创建车辆需求',
        method: 'POST',
        path: '/api/vehicle-demand',
        description: '创建新的车辆需求',
        requestBody: '{ planDate, requestDate, materialName, vehicleCount, supplierName }',
      },
      {
        key: 'vehicle-demand-search',
        title: '搜索车辆需求',
        method: 'GET',
        path: '/api/vehicle-demand/search',
        description: '搜索车辆需求',
        queryParams: ['page: number', 'size: number', 'planDate: string', 'supplierName: string', 'isConfirmed: string'],
      },
      {
        key: 'vehicle-demand-confirm',
        title: '确认车辆需求',
        method: 'POST',
        path: '/api/vehicle-demand/confirm/{id}',
        description: '确认车辆需求',
        params: ['id: number'],
      },
      {
        key: 'payment-application-create',
        title: '创建付款申请',
        method: 'POST',
        path: '/api/payment-application',
        description: '创建付款申请',
        requestBody: '{ applicationNo, paymentAmount, payeeName, payeeAccount, paymentType }',
      },
      {
        key: 'payment-application-list',
        title: '付款申请列表',
        method: 'GET',
        path: '/api/payment-application/list',
        description: '获取付款申请列表',
        queryParams: ['page: number', 'size: number', 'approvalStatus: string', 'startDate: string', 'endDate: string'],
      },
      {
        key: 'payment-application-approve',
        title: '批准付款申请',
        method: 'POST',
        path: '/api/payment-application/approve/{id}',
        description: '批准付款申请',
        params: ['id: number'],
      },
      {
        key: 'payment-application-reject',
        title: '拒绝付款申请',
        method: 'POST',
        path: '/api/payment-application/reject/{id}',
        description: '拒绝付款申请',
        params: ['id: number'],
      },
      {
        key: 'supplier-info-create',
        title: '创建供应商',
        method: 'POST',
        path: '/api/supplier-info',
        description: '创建供应商信息',
        requestBody: '{ supplierCode, fullName, province, city, contactPerson, contactPhone }',
      },
      {
        key: 'supplier-info-search',
        title: '搜索供应商',
        method: 'GET',
        path: '/api/supplier-info/search',
        description: '搜索供应商信息',
        queryParams: ['page: number', 'size: number', 'supplierCode: string', 'province: string', 'cooperationStatus: string', 'fullName: string'],
      },
      {
        key: 'supplier-info-suspend',
        title: '暂停供应商合作',
        method: 'POST',
        path: '/api/supplier-info/suspend/{id}',
        description: '暂停与供应商的合作',
        params: ['id: number'],
      },
      {
        key: 'supplier-info-activate',
        title: '激活供应商合作',
        method: 'POST',
        path: '/api/supplier-info/activate/{id}',
        description: '激活与供应商的合作',
        params: ['id: number'],
      },
    ],
  },
  {
    key: 'steel',
    title: '钢铁价格',
    children: [
      {
        key: 'scrap-price-list',
        title: '废钢价格列表',
        method: 'GET',
        path: '/api/scrap-steel-prices/list',
        description: '获取废钢价格列表',
        queryParams: ['page: number', 'size: number', 'company: string', 'material_type: string', 'start_date: string', 'end_date: string'],
      },
      {
        key: 'scrap-price-by-company',
        title: '按公司查询废钢价格',
        method: 'GET',
        path: '/api/scrap-steel-prices/company/{company}',
        description: '根据公司获取废钢价格',
        params: ['company: string'],
      },
      {
        key: 'scrap-change-list',
        title: '废钢价格变动列表',
        method: 'GET',
        path: '/api/scrap-price-changes/list',
        description: '获取废钢价格变动记录',
        queryParams: ['page: number', 'size: number', 'company: string', 'material_type: string', 'start_news_date: string', 'end_news_date: string'],
      },
      {
        key: 'scrap-adjustment-list',
        title: '废钢调价公告列表',
        method: 'GET',
        path: '/api/scrap-price-adjustments/list',
        description: '获取废钢调价公告',
        queryParams: ['page: number', 'size: number', 'company: string', 'material_keyword: string', 'start_news_date: string', 'end_news_date: string'],
      },
      {
        key: 'steel-market-list',
        title: '钢铁市场行情列表',
        method: 'GET',
        path: '/api/steel-market-prices/list',
        description: '获取钢铁市场行情',
        queryParams: ['page: number', 'size: number', 'category: string', 'area: string', 'product_name: string', 'start_price_date: string', 'end_price_date: string'],
      },
    ],
  },
  {
    key: 'finance',
    title: '财务模块',
    children: [
      {
        key: 'daily-fund-plan-list',
        title: '每日资金计划',
        method: 'GET',
        path: '/daily-payment-plan/list',
        description: '获取每日资金计划列表',
        queryParams: ['page: number', 'size: number'],
      },
      {
        key: 'daily-payment-plan-list',
        title: '每日付款计划',
        method: 'GET',
        path: '/daily-payment-plan/list',
        description: '获取每日付款计划列表',
        queryParams: ['page: number', 'size: number'],
      },
    ],
  },
  {
    key: 'sales',
    title: '销售模块',
    children: [
      {
        key: 'sales-order-list',
        title: '销售订单列表',
        method: 'GET',
        path: '/orders/list',
        description: '获取销售订单列表',
        queryParams: ['page: number', 'size: number', 'startDate: string', 'endDate: string'],
      },
      {
        key: 'sales-order-get',
        title: '获取销售订单',
        method: 'GET',
        path: '/orders/{id}',
        description: '根据ID获取销售订单详情',
        params: ['id: number'],
      },
      {
        key: 'sales-order-create',
        title: '创建销售订单',
        method: 'POST',
        path: '/orders/create',
        description: '创建新的销售订单',
        requestBody: '{ contractNo, company, customer, material, signDate, termDays, contractQty, unitPrice, payType, executePeriod, remark }',
      },
      {
        key: 'sales-order-update',
        title: '更新销售订单',
        method: 'PUT',
        path: '/orders/{id}',
        description: '更新销售订单信息',
        params: ['id: number'],
      },
      {
        key: 'sales-order-delete',
        title: '删除销售订单',
        method: 'DELETE',
        path: '/orders/{id}',
        description: '删除销售订单',
        params: ['id: number'],
      },
      {
        key: 'sales-order-detail',
        title: '销售订单明细',
        method: 'GET',
        path: '/order-detail/order/{orderId}',
        description: '获取销售订单明细',
        params: ['orderId: number'],
      },
      {
        key: 'sales-detail-delete',
        title: '删除订单明细',
        method: 'DELETE',
        path: '/order-detail/{id}',
        description: '删除订单明细',
        params: ['id: number'],
      },
      {
        key: 'sales-plan-list',
        title: '销售计划列表',
        method: 'GET',
        path: '/api/sales-plan/list',
        description: '获取销售计划列表',
        queryParams: ['page: number', 'size: number'],
      },
      {
        key: 'order-export',
        title: '导出订单',
        method: 'GET',
        path: '/api/orders/export',
        description: '导出销售订单数据',
      },
      {
        key: 'order-import',
        title: '导入订单',
        method: 'POST',
        path: '/api/orders/import',
        description: '导入销售订单数据',
      },
      {
        key: 'order-detail-receipt',
        title: '获取大宗数据',
        method: 'GET',
        path: '/api/order-detail/receipt-weighing',
        description: '获取收货过磅大宗数据',
        queryParams: ['material: string', 'supplier: string', 'sourceFile: string', 'startDate: string', 'endDate: string'],
      },
      {
        key: 'order-detail-sync',
        title: '同步订单明细',
        method: 'POST',
        path: '/api/order-detail/sync-selected',
        description: '同步选中的大宗数据到订单明细',
        queryParams: ['orderId: number'],
      },
    ],
  },
];

export const getApiInfoText = (api: ApiEndpoint): string => {
  let text = `## ${api.title}\n\n`;
  text += `- **方法**: ${api.method}\n`;
  text += `- **路径**: ${api.path}\n`;
  text += `- **说明**: ${api.description}\n`;
  
  if (api.params && api.params.length > 0) {
    text += `\n**路径参数**:\n`;
    api.params.forEach(p => text += `- ${p}\n`);
  }
  
  if (api.queryParams && api.queryParams.length > 0) {
    text += `\n**查询参数**:\n`;
    api.queryParams.forEach(p => text += `- ${p}\n`);
  }
  
  if (api.requestBody) {
    text += `\n**请求体**: \`${api.requestBody}\`\n`;
  }
  
  if (api.responseFields && api.responseFields.length > 0) {
    text += `\n**响应字段**:\n`;
    api.responseFields.forEach(f => text += `- ${f}\n`);
  }
  
  return text;
};

export default apiData;
