
import axiosInstance from "../common/axios";
import { notifyErrorRequest } from "../common/notify";


const login = async ({email,password}) => {
  try {
      const response = await axiosInstance.post(`/users/login`, {email,password});
      console.log(response);
      return response.data;
  } catch (error) {
    console.error(error);
    const message = error.response.data.error || 'Error al iniciar sesión'
    notifyErrorRequest(message);
    
  }
}


export { login };

