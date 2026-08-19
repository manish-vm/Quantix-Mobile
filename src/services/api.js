import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getDefaultApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'https://quantix-backend-2w1l.onrender.com/api';
  }
  return 'https://quantix-backend-2w1l.onrender.com/api';
};

export const API_BASE_URL = 'https://quantix-backend-2w1l.onrender.com/api' || getDefaultApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
  updateMe: (payload) => api.put('/auth/me', payload)
};

export const scanApi = {
  getSummary: () => api.get('/scan/summary'),
  getHistory: () => api.get('/scan/user-history'),
  getVendorHistory: () => api.get('/scan/vendor-history'),
  getLogs: (params = {}) => api.get('/scan/logs', { params }),
  getDemoData: (partNo) => api.get(`/demo-data/${encodeURIComponent(partNo)}`),
  getAllDemoData: () => api.get('/demo-data'),
  createDemoData: (payload) => api.post('/demo-data', payload),
  getProducts: (params = {}) => api.get('/products', { params }),
  createProduct: (payload) => api.post('/products', payload),
  updateProduct: (id, payload) => api.put(`/products/${id}`, payload),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getVendorSubmissions: (partNo) => api.get('/scan/vendor-submissions', { params: { partNo } }),
  validate: (payload) => api.post('/scan', payload)
};

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard'),
  products: () => api.get('/reports/products')
};

export const employeesApi = {
  list: (employeeType) => api.get('/admin/employees', {
    params: employeeType ? { employeeType } : undefined
  }),
  create: (payload) => api.post('/admin/employees', payload),
  update: (id, payload) => api.put(`/admin/employees/${id}`, payload),
  delete: (id) => api.delete(`/admin/employees/${id}`)
};

export default api;
