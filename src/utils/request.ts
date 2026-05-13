import { message } from 'antd';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
  token?: string;
}

// 后端服务基础URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    ...restOptions
  } = options;

  // 构建完整的 URL（如果有查询参数）
  let fullUrl = `${BASE_URL}${url}`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    fullUrl += `?${searchParams.toString()}`;
  }

  // 配置默认请求头
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 获取 token，但登录请求不携带 Authorization 头
  const token = localStorage.getItem('token');
  const isLoginRequest = url.includes('/api/auth/login');
  if (token && !isLoginRequest) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 合并请求头
  const mergedHeaders = {
    ...defaultHeaders,
    ...headers,
  };

  try {
    // 构建请求配置
    const requestConfig: RequestInit = {
      method,
      headers: mergedHeaders,
      ...restOptions,
    };

    // 如果有请求体且不是 FormData，则转换为 JSON 字符串
    if (body && !(body instanceof FormData)) {
      requestConfig.body = JSON.stringify(body);
    } else if (body) {
      // 如果是 FormData，则移除 Content-Type，让浏览器自动设置
      delete (requestConfig.headers as Record<string, string>)['Content-Type'];
      requestConfig.body = body;
    }

    // 发送请求
    const response = await fetch(fullUrl, requestConfig);

    // 检查响应状态
    if (!response.ok) {
      // 处理 401 错误（token 过期）
      if (response.status === 401) {
        // 清除本地存储的 token
        localStorage.removeItem('token');
        // 跳转到登录页面
        window.location.href = '/login';
        throw new Error('Token expired, redirecting to login');
      }
      
      // 尝试解析响应数据
      try {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = {
          status: response.status,
          data: errorData
        };
        throw error;
      } catch (jsonError) {
        // 如果解析失败，抛出原始错误
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    // 解析响应数据
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      message.error('响应数据解析失败');
      throw new Error('响应数据解析失败');
    }

    // 检查响应数据格式
    if (!responseData) {
      console.error('Invalid response data format:', responseData);
      message.error('响应数据格式错误');
      throw new Error('响应数据格式错误');
    }

    // 处理直接返回数组的情况（如 /api/roles/all）
    if (Array.isArray(responseData)) {
      console.log('Response is an array, treating as successful:', responseData);
      return responseData;
    }

    // 处理标准格式的响应
    if (typeof responseData === 'object') {
      // 检查业务逻辑状态码
      console.log('Response code:', responseData.code, 'Type:', typeof responseData.code);
      const code = parseInt(responseData.code);
      if (isNaN(code) || code !== 200) {
        const errorMessage = responseData.message || '请求失败';
        // 检查错误信息是否包含特定内容，如果包含则不显示错误信息，由调用方处理
        if (!errorMessage.includes('用户已经锁定') && !errorMessage.includes('设备无权限')) {
          message.error(errorMessage);
        }
        throw new Error(errorMessage);
      }
      console.log('Request successful, returning data:', responseData.data);

      // 如果响应中有 token，存储它
      if (responseData.data && responseData.data.token) {
        localStorage.setItem('token', responseData.data.token);
      }

      return responseData.data;
    }

    // 其他情况视为错误
    console.error('Invalid response data format:', responseData);
    message.error('响应数据格式错误');
    throw new Error('响应数据格式错误');
  } catch (error) {
    console.error('Request error:', error);
    
    // 处理网络错误，可能是CORS导致的401错误
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // 清除本地存储的token
      localStorage.removeItem('token');
      // 显示错误信息
      message.error('登录已过期，请重新登录');
      // 跳转到登录页面
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } else {
      // 只在特定错误情况下才清除 token 并跳转
      // 1. 401 错误（token 过期或无效）
      // 2. 特定的业务逻辑错误
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('401') || errorMessage.includes('Token expired') || errorMessage.includes('Unauthorized')) {
        localStorage.removeItem('token');
        message.error('登录已过期，请重新登录');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else {
        // 检查错误信息是否包含特定内容，如果包含则不显示通用错误信息
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('用户已经锁定') && !errorMessage.includes('设备无权限')) {
          // 其他错误不跳转，只显示错误信息
          message.error('请求失败，请稍后重试');
        }
      }
    }
    
    throw error;
  }
};

// 导出常用的请求方法
export default {
  get: <T = any>(url: string, params?: Record<string, any>, options?: RequestOptions) => {
    return request<T>(url, {
      method: 'GET',
      params,
      ...options,
    });
  },
  post: <T = any>(url: string, data?: any, options?: RequestOptions) => {
    return request<T>(url, {
      method: 'POST',
      body: data,
      ...options,
    });
  },
  put: <T = any>(url: string, data?: any, options?: RequestOptions) => {
    return request<T>(url, {
      method: 'PUT',
      body: data,
      ...options,
    });
  },
  delete: <T = any>(url: string, data?: any, options?: RequestOptions) => {
    return request<T>(url, {
      method: 'DELETE',
      body: data,
      ...options,
    });
  },
  // 支持带查询参数的 DELETE 请求
  deleteWithParams: <T = any>(url: string, params?: Record<string, any>, options?: RequestOptions) => {
    return request<T>(url, {
      method: 'DELETE',
      params,
      ...options,
    });
  },
};
