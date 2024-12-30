import { check } from "express-validator";
import webToken from "../middleware/webToken";
import { Roles } from "../interfaces/rolesInterface";
import { validateFields } from "../middleware/validateFields";
import { TypeSensor } from "../interfaces/typeSensorInterface";
import Farm from "../models/farms"
import SensorsDB from "../models/sensorsDB";

const sensorsDBValidations = {
  validateBody: [
    check("id").custom((id, { req }) => {
        if (!req.is("application/json") || Object.keys(req.body).length === 0) {
          throw new Error("Los datos son requeridos");
        }
  
        if (req.method==="PUT" && !id) {
          throw new Error("El id es requerido");
        }
  
        return true;
      }),

    check("name").custom((name) => {
      if (!name) {
        throw new Error("El nombre es requerido");
      }

      return true;
    }),

    check("farm").custom(async (farm, {req}) => {
      if (!farm) {
        throw new Error("La finca es requerida");
      }

      const farmDB = await Farm.findById(farm)
      if(!farmDB){
        throw new Error("La finca no existe")
      }
      if(!farmDB.status){
        throw new Error("La finca no esta activa")
      }

      return true;
    }),

    check("type").custom(async (type, {req}) => {
      if (!type) {
        throw new Error("El tipo de sensor es requerido");
      }

      const upperType = type.toUpperCase();

      if (!Object.values(TypeSensor).includes(upperType as TypeSensor)) {
        throw new Error("Tipo de sensor no válido");
      }

      const farm = req.body.farm
      const sensorDB = await SensorsDB.findOne({$and: [{farm}, {type: upperType}]})
      if(sensorDB){
        if(req.method==="PUT" && req.body.id===sensorDB._id){
          throw new Error("La finca ya tiene un sensor tipo " + upperType)
        }else if(req.method==="POST"){
          throw new Error("La finca ya tiene un sensor tipo " + upperType)
        }
      }
      return true;
    }),

    check("access_token").custom(async (access_token, { req }) => {
      if (!access_token) {
        throw new Error("Token is required");
      }
      const user = await webToken.validateToken(access_token);
      //auth only user with role admin
      if (user.role != Roles.ADMIN) {
        throw new Error("Auth Error");
      }
      req.user = user;
    }),

    validateFields,
  ],
};

export { sensorsDBValidations };
