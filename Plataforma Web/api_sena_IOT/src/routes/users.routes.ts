import { Router } from "express";
import { usersController } from "../controller/users.controller";
import { usersValidations } from "../validations/users.validations";

const routerUsers = Router();

routerUsers.get("/", usersValidations.validateTokenAdmin, usersController.getUsers);
routerUsers.get("/forgot-password/:email", usersController.forgotPassword);
routerUsers.get("/:id", usersValidations.validateToken, usersController.getUserById);
routerUsers.post("/create",usersValidations.validateTokenAdmin, usersController.create);
routerUsers.post("/login", usersController.login);
routerUsers.put("/update", usersValidations.validateTokenAdmin, usersController.update);
routerUsers.put("/new-password", usersValidations.validateTokenTemp, usersController.putNewPassword)

export { routerUsers };
