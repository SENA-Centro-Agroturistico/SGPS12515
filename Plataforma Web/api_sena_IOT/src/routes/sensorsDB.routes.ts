import { Router } from "express";
import { sensorsDBController } from "../controller/sensorsDB.controller";
import { usersValidations } from "../validations/users.validations";
import { sensorsDBValidations } from "../validations/sensorsDB.validations";

const routerSensorsDB = Router();

routerSensorsDB.get("/", usersValidations.validateTokenAdmin, sensorsDBController.getSensors);
routerSensorsDB.post("/create", sensorsDBValidations.validateBody, sensorsDBController.create);
routerSensorsDB.put("/update", sensorsDBValidations.validateBody, sensorsDBController.update);

export { routerSensorsDB };
