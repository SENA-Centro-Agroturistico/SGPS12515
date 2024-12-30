
import axiosInstance from "../common/axios";
import { notifyErrorRequest } from "../common/notify";


const getFarmsApi = async () => {
  try {
      const response = await axiosInstance.get(`/farms`);
      console.log(response);
      return response.data;
  } catch (error) {
    console.error(error);
    const message = error.response.data.message || 'Error al obtener las fincas'
    notifyErrorRequest(message);
  }
}

const createFarmApi = async (dataFarm) => {
    try {
        const response = await axiosInstance.post(`/farms/create`, dataFarm); 
        console.log(response);
        return response;
    } catch (error) {
      console.error(error);
      const message = error.response.data.message || 'Error al crear la finca'
      notifyErrorRequest(message);
    }
}

const updateFarmApi = async (dataFarm) => {
    try {
        const response = await axiosInstance.put(`/farms/update`, dataFarm);
        console.log(response);
        return response;
    } catch (error) {
      console.error(error);
      const message = error.response.data.message || 'Error al actualizar la finca'
      notifyErrorRequest(message);
    }
}


export { getFarmsApi, createFarmApi, updateFarmApi };

