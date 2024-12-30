import axios from 'axios';
import { envs } from './dotenv';


const axiosInstance = axios.create({
  baseURL: `${envs.INFLUXDB_URL}/api/v2/`, // Reemplaza con la URL base de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = envs.INFLUXDB_TOKEN

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;