import { Router } from "express";
import { farmsController } from "../controller/farms.controller";
import { usersValidations } from "../validations/users.validations";

const routerFarms = Router();

routerFarms.get("/", usersValidations.validateTokenAdmin, farmsController.getFarms);
routerFarms.post("/create", usersValidations.validateTokenAdmin, farmsController.create);
routerFarms.put("/update", usersValidations.validateTokenAdmin, farmsController.update);

export { routerFarms };
