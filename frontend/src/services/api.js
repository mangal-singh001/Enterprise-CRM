import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization Bearer Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Catch 401 Unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized token.');
      // Keep user state in context to display login error state
    }
    return Promise.reject(error);
  }
);

export const authService = {
  verifySsoToken: async (token) => {
    const response = await API.post('/auth/verify-token', { token });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
};

export const metadataService = {
  getProducts: async () => {
    const response = await API.get('/metadata/products');
    return response.data;
  },
  getProductSchema: async (productId) => {
    const response = await API.get(`/metadata/products/${productId}`);
    return response.data;
  },
  getEntitySchema: async (productId, entityId) => {
    const response = await API.get(`/metadata/entities/${productId}/${entityId}`);
    return response.data;
  },
};

export const edupulseService = {
  getPlans: async (params) => {
    const response = await API.get('/edupulse/plans', { params });
    return response.data;
  },
  createPlan: async (data) => {
    const response = await API.post('/edupulse/plans', data);
    return response.data;
  },
  updatePlan: async (id, data) => {
    const response = await API.put(`/edupulse/plans/${id}`, data);
    return response.data;
  },
  deletePlan: async (id) => {
    const response = await API.delete(`/edupulse/plans/${id}`);
    return response.data;
  },

  getTemplates: async (params) => {
    const response = await API.get('/edupulse/templates', { params });
    return response.data;
  },
  createTemplate: async (data) => {
    const response = await API.post('/edupulse/templates', data);
    return response.data;
  },
  updateTemplate: async (id, data) => {
    const response = await API.put(`/edupulse/templates/${id}`, data);
    return response.data;
  },
  deleteTemplate: async (id) => {
    const response = await API.delete(`/edupulse/templates/${id}`);
    return response.data;
  },
};

export const cloudmetricService = {
  getSites: async (params) => {
    const response = await API.get('/cloudmetric/sites', { params });
    return response.data;
  },
  createSite: async (data) => {
    const response = await API.post('/cloudmetric/sites', data);
    return response.data;
  },
  updateSite: async (id, data) => {
    const response = await API.put(`/cloudmetric/sites/${id}`, data);
    return response.data;
  },
  deleteSite: async (id) => {
    const response = await API.delete(`/cloudmetric/sites/${id}`);
    return response.data;
  },
  generateApiKey: async () => {
    const response = await API.post('/cloudmetric/generate-api-key');
    return response.data;
  },
};

export const analyticsService = {
  getDashboardSummary: async () => {
    const response = await API.get('/analytics/dashboard-summary');
    return response.data;
  },
  getAuditLogs: async () => {
    const response = await API.get('/analytics/audit-logs');
    return response.data;
  },
};

export default API;
