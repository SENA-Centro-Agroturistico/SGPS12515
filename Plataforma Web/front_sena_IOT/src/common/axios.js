import axios from 'axios';
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.defaults.withCredentials = true;

//interceptor para detectar un error 401 y redirigir al login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      Cookies.remove("access_token");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);



export default axiosInstance;