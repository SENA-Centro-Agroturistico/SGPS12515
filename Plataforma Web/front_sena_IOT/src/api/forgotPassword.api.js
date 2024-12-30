import axiosInstance from "../common/axios";
import { notifyErrorRequest } from "../common/notify";

const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.get(
      `/users/forgot-password/${email}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    const message =
      error.response.data.error || "Error al recuperar contraseña";
    notifyErrorRequest(message);
    throw new Error(message);
  }
};

const putNewPassword = async ({ email, password }, token) => {
  try {
    const response = await axiosInstance.put(
      `/users/new-password`,
      {
        email,
        password,
      },
      {
        headers: {
          token_temp: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    const message =
      error.response.data.error || "Error al crear nueva contraseña";
    notifyErrorRequest(message);
    throw new Error(message);
  }
};

export { forgotPassword, putNewPassword };
