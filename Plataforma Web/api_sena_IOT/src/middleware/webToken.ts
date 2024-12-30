import jwt from "jsonwebtoken";
import { envs } from "../config/dotenv";

const webToken = {
  /**
   * Generates a JSON Web Token (JWT) with the provided user's id and username as payload.
   * The token has a 7-day expiration time and is signed using the HS256 algorithm.
   *
   * @param {any} user - The user object containing the id and username.
   * @return {string} The generated JSON Web Token.
   * @throws {Error} If there is an error while generating the token.
   */
  generateToken(user: any): string {
    // Define the payload containing the user's id and username
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    try {
      // Generate the token using the payload, secret, and options
      const token = jwt.sign(payload, envs.JWT_SECRET, {
        expiresIn: "7d",
        algorithm: "HS256",
      });
      return token;
    } catch (err) {
      // Throw an error if there is an issue generating the token
      throw new Error("Error al generar el token");
    }
  },

  generateTokenTemp(user: any): string {
    // Define the payload containing the user's id and username
    const payload = {
      id: user.id,
      username: user.username,
    };

    try {
      // Generate the token using the payload, secret, and options
      const token = jwt.sign(payload, envs.JWT_SECRET, {
        expiresIn: "1h",
        algorithm: "HS256",
      });
      return token;
    } catch (err) {
      // Throw an error if there is an issue generating the token
      throw new Error("Error al generar el token");
    }
  },

  /**
   * Validates a JSON Web Token (JWT) and returns its payload if the token is valid.
   *
   * @param {string} token - The token to be validated.
   * @return {any} The payload of the token if it is valid.
   * @throws {Error} If the token is not provided, expired, or invalid.
   */
  validateToken(token: string): any {
    // Check if the token is provided
    if (!token) {
      throw new Error("Token no proporcionado");
    }

    try {
      // Verify the token using the secret and options
      const payload = jwt.verify(token, envs.JWT_SECRET);

      if (typeof payload !== "object") {
        throw new Error("Token invalido");
      }

      return payload;
    } catch (err: any) {
      // Handle different types of token errors
      if (err.name === "TokenExpiredError") {
        throw new Error("Token expirado");
      }
      throw new Error("Token invalido");
    }
  },
};

export default webToken;
