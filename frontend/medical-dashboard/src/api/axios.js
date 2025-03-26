import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Handle FormData content type
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
    delete config.headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location = '/';
    }
    toast.error(error.response?.data?.message || 'Something went wrong');
    return Promise.reject(error);
  }
);

export default api;