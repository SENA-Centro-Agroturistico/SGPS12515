import { Router } from "express";
import { whatsappController } from "../controller/whatsapp.controller";
import { whatsappValidations } from "../validations/whatsapp.validations";

const routerWhatsapp = Router();

routerWhatsapp.get("/", whatsappValidations.validGetGroup, whatsappController.getIdGroup);
routerWhatsapp.post("/sendMessage",whatsappValidations.validateSendMessage, whatsappController.sendMessage);


export { routerWhatsapp };

