
import axiosInstance from "../common/axios";
import { notifyErrorRequest } from "../common/notify";


const getUsersApi = async () => {
  try {
      const response = await axiosInstance.get(`/users`);
      console.log(response);
      return response.data;
  } catch (error) {
    console.error(error);
    const message = error.response.data.message || 'Error al obtener los usuarios'
    notifyErrorRequest(message);
  }
}

const getUserApi = async (id) => {
  try {
      const response = await axiosInstance.get(`/users/${id}`);
      console.log(response);
      return response.data;
  } catch (error) {
    console.error(error);
    const message = error.response.data.message || 'Error al obtener el usuario'
    notifyErrorRequest(message);
  }
}

const createUserApi = async (dataUser) => {
    try {
        const response = await axiosInstance.post(`/users/create`, dataUser);
        console.log(response);
        return response;
    } catch (error) {
      console.error(error);
      const message = error.response.data.message || 'Error al crear el usuario'
      notifyErrorRequest(message);
    }
}

const updateUserApi = async (dataUser) => {
    try {
        const response = await axiosInstance.put(`/users/update`, dataUser);
        console.log(response);
        return response;
    } catch (error) {
      console.error(error);
      const message = error.response.data.message || 'Error al actualizar el usuario'
      notifyErrorRequest(message);
    }
}


export { getUsersApi, createUserApi, updateUserApi, getUserApi };

