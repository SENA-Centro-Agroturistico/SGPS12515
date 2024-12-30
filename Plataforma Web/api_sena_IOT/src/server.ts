import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { routerUsers } from "./routes/users.routes";
import { routerSensors } from "./routes/sensors.routes";
import { routerSensorsDB } from "./routes/sensorsDB.routes";
import { routerFarms } from "./routes/farms.routes";
import dbConnection from "./database/database_mongo";
import { Client, LocalAuth } from "whatsapp-web.js";
import { whatsappConnection } from "./config/whatsapp";
import { routerWhatsapp } from "./routes/whatsapp.routes";
import { init } from "./database/init";
import path from "path";
import * as io from "socket.io";
import http from "http"
import { controllerSocket } from "./sockets/controller";
//import { sendSocketMessage } from "./sockets/prueba";

declare global {
  var io: io.Server;
}

class ServerIoT {
  server: http.Server;
  ioServer: io.Server;
  app: express.Application;
  port: number;
  client: Client | undefined;
  constructor() {
    this.app = express();
    this.port = (process.env.PORT as unknown as number) || 4000;
    this.server = http.createServer(this.app);
    this.ioServer = new io.Server(this.server, {
      cors: {
        origin: "*",
      },

    });
    this.middlewares();
    this.routes();
    this.connectDB();
    this.initializeWhatsApp();
    this.socket()
  }

  async initializeWhatsApp() {
    await whatsappConnection();
  }

  middlewares() {
    // Configura el límite de peticiones
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Límite de 100 peticiones por IP
      message: "Too many requests from this IP, please try again later.",
    });

    this.app.use(limiter); // Aplica el middleware de límite de peticiones

    this.app.use(
      cors({
        origin: "*",
        // origin: "http://localhost:5173",
        credentials: true,
      })
    );
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));

    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  routes() {
    this.app.use("/api/v1/users", routerUsers);
    this.app.use("/api/v1/sensors", routerSensors);
    this.app.use("/api/v1/sensorsDB", routerSensorsDB)
    this.app.use("/api/v1/farms", routerFarms);
    this.app.use("/api/v1/whatsapp", routerWhatsapp);
    this.app.get("/api", (req, res) => {        
      this.ioServer.emit("prueba", {msg: "todo ok"})  
      res.send("life");
    });
    //this.app.get("/api/v1/socket", sendSocketMessage(this.ioServer))

    // Ruta para servir el archivo HTML principal
    this.app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    });
  }

  socket(){
    this.app.set('socketio', this.ioServer)
    global.io = this.ioServer.on('connection', controllerSocket);
  }

  async connectDB() {
    await dbConnection();
    await init.createUser();
  }
 
  listen() {
    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

export { ServerIoT };