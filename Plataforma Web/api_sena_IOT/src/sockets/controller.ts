import {Socket} from "socket.io";

const controllerSocket = (socket: Socket)=>{
    console.log("Nuevo cliente conectado:", socket.id);

    socket.on("node", (data)=>{
      console.log("Mensaje recibido:", data);
    })

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      console.log(`Connection error: ${err.message}`);
    });

}

export {controllerSocket}