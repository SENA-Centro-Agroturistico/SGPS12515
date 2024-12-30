import { validateFields } from "../middleware/validateFields";
import { check } from "express-validator";
import webToken from "../middleware/webToken";
import { validateToken, validationsApiKey } from "./whatsapp.validations";

const sensorsValidations = {
  validateQuery: [
    check("farm").custom((farm, { req }) => {
      if (farm && (!req.body || !req.body.sensor)) {
        throw new Error("La finca y el sensor son requeridos");
      }
      return true;
    }),
    check("sensor").custom((sensor, { req }) => {
      if (sensor && (!req.body || !req.body.farm)) {
        throw new Error("La finca y el sensor son requeridos");
      }
      return true;
    }),
    check("dateStart").custom((dateStart, { req }) => {
      if (dateStart && (!req.body || !req.body.dateEnd)) {
        throw new Error("La fecha de inicio es requerida");
      }
      return true;
    }),
    check("dateEnd").custom((dateEnd, { req }) => {
      if (dateEnd && (!req.body || !req.body.dateStart)) {
        throw new Error("La fecha de fin es requerida");
      }
      return true;
    }),
    check("type").custom((type, { req }) => {
      if (type && !['m', 'd', 'h', 'range'].includes(type)) {
        throw new Error("El campo type es requerido");
      }
      return true;
    }),
    check("value").custom((value, { req }) => {
      if (!value) {
        throw new Error("El campo value es requerido");
      }
      return true;
    }),
    check("access_token").custom(async (access_token) => {
      if (!access_token) {
        throw new Error("Token is required");
      }
      await webToken.validateToken(access_token);
    }),
    validateFields,
  ],
  validateReport: [
    check("farm").custom((farm, { req }) => {
      if (farm && !req.body) {
        throw new Error("La finca es requerida");
      }
      return true;
    }),
    check("dateStart").custom((dateStart, { req }) => {
      if (dateStart && (!req.body || !req.body.dateEnd)) {
        throw new Error("La fecha de inicio es requerida");
      }
      return true;
    }),
    check("dateEnd").custom((dateEnd, { req }) => {
      if (dateEnd && (!req.body || !req.body.dateStart)) {
        throw new Error("La fecha de fin es requerida");
      }
      return true;
    }),
    check("access_token").custom(async (access_token) => {
      if (!access_token) {
        throw new Error("Token is required");
      }
      await webToken.validateToken(access_token);
    }),
  ],

  validateToken: [
    check("access_token").custom(async (access_token) => {
      if (!access_token) {
        throw new Error("Token is required");
      }
      await webToken.validateToken(access_token);
    }),
    validateFields,
  ],

  validateSendSocket: [
    validationsApiKey,
    validateToken,
    validateFields,
  ],
};

export { sensorsValidations };
