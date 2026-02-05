import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AdminJwtPayload, Category, DashboardData, Order, OrderStatus, Product } from '../types';

const API_BASE_URL = 'https://darkcod.duckdns.org';
const TOKEN_KEY = 'admin_access_token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const buildUrl = (path: string): string => `${API_BASE_URL}${path}`;

export const getStoredToken = async (): Promise<string | null> => AsyncStorage.getItem(TOKEN_KEY);

export const setStoredToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const decodeToken = (token: string): AdminJwtPayload => jwtDecode<AdminJwtPayload>(token);

export const isTokenValidAdmin = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    const now = Math.floor(Date.now() / 1000);
    return payload.role === 'admin' && payload.exp > now;
  } catch {
    return false;
  }
};

export const adminLogin = async (email: string, password: string): Promise<string> => {
  const response = await fetch(buildUrl('/adminapi/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login: email,
      password,
    }),
  });

  if (!response.ok) {
    const fallback = 'Ошибка входа';
    let message = fallback;

    if (response.status === 401) {
      message = 'Неверный email или пароль';
    } else if (response.status === 403) {
      message = 'Доступ запрещён';
    } else {
      try {
        const data = (await response.json()) as { detail?: string };
        message = data.detail || fallback;
      } catch {
        message = fallback;
      }
    }

    throw new ApiError(response.status, message);
  }

  const data = (await response.json()) as { access_token: string; token_type: string };
  if (!data.access_token) {
    throw new ApiError(500, 'Сервер не вернул токен');
  }

  return data.access_token;
};

export const authFetch = async (
  path: string,
  options: RequestInit = {},
  onUnauthorized?: () => Promise<void> | void,
): Promise<Response> => {
  const token = await getStoredToken();

  if (!token || !isTokenValidAdmin(token)) {
    await clearStoredToken();
    if (onUnauthorized) {
      await onUnauthorized();
    }
    throw new ApiError(401, 'Требуется авторизация администратора');
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    await clearStoredToken();
    if (onUnauthorized) {
      await onUnauthorized();
    }
    throw new ApiError(response.status, response.status === 403 ? 'Доступ запрещён' : 'Сессия истекла');
  }

  return response;
};

const parseJsonOrThrow = async <T>(response: Response, defaultMessage: string): Promise<T> => {
  if (!response.ok) {
    try {
      const data = (await response.json()) as { detail?: string };
      throw new ApiError(response.status, data.detail || defaultMessage);
    } catch {
      throw new ApiError(response.status, defaultMessage);
    }
  }

  return (await response.json()) as T;
};

export const getDashboard = async (onUnauthorized?: () => Promise<void> | void): Promise<DashboardData> => {
  const response = await authFetch('/adminapi/dashboard', { method: 'GET' }, onUnauthorized);
  return parseJsonOrThrow<DashboardData>(response, 'Не удалось загрузить dashboard');
};

export const getOrders = async (onUnauthorized?: () => Promise<void> | void): Promise<Order[]> => {
  const response = await authFetch('/adminapi/orders', { method: 'GET' }, onUnauthorized);
  return parseJsonOrThrow<Order[]>(response, 'Не удалось загрузить заказы');
};

export const getOrderById = async (id: number, onUnauthorized?: () => Promise<void> | void): Promise<Order> => {
  const response = await authFetch(`/adminapi/orders/${id}`, { method: 'GET' }, onUnauthorized);
  return parseJsonOrThrow<Order>(response, 'Не удалось загрузить заказ');
};

export const updateOrderStatus = async (
  id: number,
  status: OrderStatus,
  onUnauthorized?: () => Promise<void> | void,
): Promise<Order> => {
  const response = await authFetch(
    `/adminapi/orders/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    onUnauthorized,
  );

  return parseJsonOrThrow<Order>(response, 'Не удалось обновить статус заказа');
};

export const getProducts = async (onUnauthorized?: () => Promise<void> | void): Promise<Product[]> => {
  const response = await authFetch('/adminapi/products', { method: 'GET' }, onUnauthorized);
  return parseJsonOrThrow<Product[]>(response, 'Не удалось загрузить товары');
};

export const createProduct = async (
  payload: Omit<Product, 'id'>,
  onUnauthorized?: () => Promise<void> | void,
): Promise<Product> => {
  const response = await authFetch(
    '/adminapi/products',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    onUnauthorized,
  );

  return parseJsonOrThrow<Product>(response, 'Не удалось создать товар');
};

export const updateProduct = async (
  id: number,
  payload: Partial<Omit<Product, 'id'>>,
  onUnauthorized?: () => Promise<void> | void,
): Promise<Product> => {
  const response = await authFetch(
    `/adminapi/products/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    onUnauthorized,
  );

  return parseJsonOrThrow<Product>(response, 'Не удалось обновить товар');
};

export const deleteProduct = async (id: number, onUnauthorized?: () => Promise<void> | void): Promise<void> => {
  const response = await authFetch(`/adminapi/products/${id}`, { method: 'DELETE' }, onUnauthorized);
  if (!response.ok) {
    throw new ApiError(response.status, 'Не удалось удалить товар');
  }
};

export const getCategories = async (onUnauthorized?: () => Promise<void> | void): Promise<Category[]> => {
  const response = await authFetch('/adminapi/categories', { method: 'GET' }, onUnauthorized);
  return parseJsonOrThrow<Category[]>(response, 'Не удалось загрузить категории');
};

export const createCategory = async (
  payload: Omit<Category, 'id'>,
  onUnauthorized?: () => Promise<void> | void,
): Promise<Category> => {
  const response = await authFetch(
    '/adminapi/categories',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    onUnauthorized,
  );

  return parseJsonOrThrow<Category>(response, 'Не удалось создать категорию');
};

export const updateCategory = async (
  id: number,
  payload: Partial<Omit<Category, 'id'>>,
  onUnauthorized?: () => Promise<void> | void,
): Promise<Category> => {
  const response = await authFetch(
    `/adminapi/categories/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    onUnauthorized,
  );

  return parseJsonOrThrow<Category>(response, 'Не удалось обновить категорию');
};

export const deleteCategory = async (id: number, onUnauthorized?: () => Promise<void> | void): Promise<void> => {
  const response = await authFetch(`/adminapi/categories/${id}`, { method: 'DELETE' }, onUnauthorized);
  if (!response.ok) {
    throw new ApiError(response.status, 'Не удалось удалить категорию');
  }
};
