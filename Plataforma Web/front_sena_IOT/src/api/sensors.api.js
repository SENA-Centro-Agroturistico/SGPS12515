import axiosInstance from "../common/axios";
import { notifyErrorRequest } from "../common/notify";
import { storeUsers } from "../stores/users";

const getSensorData = async (sensor,type = 'h',value = 6) => {
  try {
    const useUsers = storeUsers();
      const response = await axiosInstance.post(`/sensors/data`,{
        sensor,
        farm: useUsers.farm._id,
        type,
        value
      });
      return response.data;
  } catch (error) {
    console.error(error);
    notifyErrorRequest(error.message || 'Error al obtener datos del sensor');
  }
}

const getSensorsApi = async () => {
  try {
      const response = await axiosInstance.get(`/sensorsDB`);
      console.log(response);
      return response.data;
  } catch (error) {
    console.error(error);
    const message = error.response.data.message || 'Error al obtener los sensores'
    notifyErrorRequest(message);
  }
}

const createSensorApi = async (dataSensor) => {
    try {
        const response = await axiosInstance.post(`/sensorsDB/create`, dataSensor); 
        console.log(response);
        return response;
    } catch (error) {
      console.error(error);
      const message = error.response.data.message || 'Error al crear el sensor'
      notifyErrorRequest(message);
    }
}

const updateSensorApi = async (dataSensor) => {
    try {
        const response = await axiosInstance.put(`/sensorsDB/update`, dataSensor);
        console.log(response);
        return response;
    } catch (error) {
      console.error(error);
      const message = error.response.data.message || 'Error al actualizar el sensor'
      notifyErrorRequest(message);
    }
}

export { getSensorData, getSensorsApi, createSensorApi, updateSensorApi };

