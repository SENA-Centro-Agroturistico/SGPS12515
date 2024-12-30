import { Router } from "express";
import { sensorsValidations } from "../validations/sensors.validations";
import { sensorsController } from "../controller/sensors.controller";


const routerSensors = Router();

routerSensors.post("/data", sensorsValidations.validateQuery, sensorsController.getDataSensors);
routerSensors.post("/report", sensorsValidations.validateReport, sensorsController.getDataReport);
routerSensors.post("/socket", sensorsValidations.validateSendSocket, sensorsController.sendSocket);

export { routerSensors };
