import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL_SOCKET, {
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("disconnect", (reason) => {
  console.log("Desconectado del servidor", reason);
});

socket.on("connect_error", (error) => {
  console.log("Error de conexión", error);
});

export default socket;