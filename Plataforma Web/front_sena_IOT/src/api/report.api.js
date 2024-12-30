import axiosInstance from "../common/axios";
import { notifyErrorRequest } from "../common/notify";

const getReportPDF = async ({ farm, fechaA, fechaB }) => {
  console.log(farm, fechaA, fechaB);
  try {
    const response = await axiosInstance.post(
      `/sensors/report`,
      {
        farm,
        dateStart: fechaA,
        dateEnd: fechaB,
      }
    );
    console.log(response);

    return response.data;
  } catch (error) {
    console.error(error);
    const message = error.response.data.error || "Error al obtener el reporte";
    notifyErrorRequest(message);
    throw new Error(message);
  }
};


export { getReportPDF };
