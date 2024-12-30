import { validateFields } from "../middleware/validateFields";
import { check } from "express-validator";

const validationsApiKey = check("api_key").custom(async (api_key, { req }) => {
  if (!api_key) {
    throw new Error("La api key es requerida");
  }
  console.log(api_key);
  console.log(process.env.API_KEY_WHATSAPP);
  const validApi = api_key === process.env.API_KEY_WHATSAPP;
  //auth only user with role admin
  if (!validApi) {
    throw new Error("Auth Error");
  }
  return true;
});

const validateToken = check("token").custom(async (token, { req }) => {
  if (!token) {
    throw new Error("El token es requerido");
  }
  //validar que el base64 sea valido y decodificarlo
  const base64 = Buffer.from(token, "base64").toString("ascii");
  console.log(base64);
  const [key, secret] = base64.split(":");
  if (!key || !secret) {
    throw new Error("Token Error");
  }
  //validar que el usuario y la contraseña sean correctos
  const validUser = key === process.env.API_KEY_WHATSAPP;
  const validPass = secret === process.env.API_SECRET_WHATSAPP;
  if (!validUser || !validPass) {
    throw new Error("Auth Token Error");
  }
  return true;
});

const whatsappValidations = {
  validateTokenAdmin: [validationsApiKey, validateToken, validateFields],

  validGetGroup: [
    //is requerid and must string
    check("nameGroup", "El nombre del grupo no es un string").isString(),
    check("nameGroup", "El nombre del grupo es requerido").notEmpty(),
    validationsApiKey,
    validateToken,
    validateFields,
  ],

  validateSendMessage: [
    //is requerid and must string
    check("type", "El tipo de envio no es un string").isString(),
    check("type", "El tipo de envio es requerido").notEmpty(),
    validationsApiKey,
    validateToken,
    validateFields,
  ],
};

export { whatsappValidations, validationsApiKey, validateToken };
