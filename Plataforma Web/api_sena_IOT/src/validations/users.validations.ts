import { validateFields } from "../middleware/validateFields";
import { check } from "express-validator";
import webToken from "../middleware/webToken";
import { Roles } from "../interfaces/rolesInterface";

const usersValidations = {
  validateToken: [
    check("access_token").custom(async (access_token, { req }) => {
      if (!access_token) {
        throw new Error("Token is required");
      }
      const user = await webToken.validateToken(access_token);
      req.user = user;
    }),
    validateFields,
  ],

  validateTokenAdmin: [
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

  validateTokenTemp: [
    check("token_temp").custom(async (token_temp, { req }) => {
      if (!token_temp) {
        throw new Error("Token is required");
      }
      
      const user = await webToken.validateToken(token_temp);
      req.user = user;
    }),
    validateFields,
  ],
};

export { usersValidations };
