import { Request, Response } from "express";
import bcryp from "bcryptjs";
import webToken from "../middleware/webToken";
import nodemailer from "nodemailer";
import User from "../models/users";
import { Roles } from "../interfaces/rolesInterface";
import Farm from "../models/farms";

const usersController = {
  /**
   * Login function to authenticate user credentials
   * @param req - Express Request object
   * @param res - Express Response object
   * @returns JSON response with token on successful login, or error message otherwise
   */
  async login(req: Request, res: Response) {
    try {
      // Get username and password from request body
      const { email, password } = req.body;

      console.log(req.body);

      let user = await User.findOne({ email:email.toUpperCase(), status: true }).populate('farms').select("+password");
      if (!user) {
        return res
          .status(400)
          .json({ message: "Usuario o contraseña incorrectos" });
      }

      if (!user.password) {
        return res.status(400).json({ message: "Login fallido" });
      }

      // Compare provided password with stored password hash
      const validPassword = await bcryp.compare(password, user.password);
      if (validPassword) {
        // si es admin retornar todas las fincas
        if(user.role == Roles.ADMIN){
          console.log('admin');
          user.farms = await Farm.find({status: true});
          console.log(user.farms);
        }

        // Generate and return JWT token on successful login
        const token = webToken.generateToken(user);
        return res
          .cookie("access_token", token, {
            httpOnly: false,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          })
          .status(200)
          .json({ message: "Login exitoso", token });
      }

      // Return error message if provided password doesn't match stored password
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos" });
    } catch (error) {
      // Log and return error message if login fails for any other reason
      console.log(error);
      return res.status(400).json({ error: "Login fallido" });
    }
  },

  /**
   * Creates a new user in the database.
   *
   * @param {Request} req - The request object containing the user's username and password.
   * @param {Response} res - The response object to send the result of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async create(req: Request, res: Response) {
    try {
      const { username, email, phone, password, farms, role } = req.body;
      console.log(req.body);

      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(400).json({ error: "El usuario ya existe" });
      }

      const user = new User({
        username,
        password,
        role,
        email,
        phone,
        farms,
      });
      if (user.password) {
        const salt = bcryp.genSaltSync();
        user.password = bcryp.hashSync(password, salt);
      }

      await user.save();

      res
        .status(200)
        .json({ user: user, message: "Registro exitoso" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Registro fallido" });
    }
  },

  /**
   * Updates a user's information in the database.
   *
   * @param {Request} req - The request object containing the user's id, old username, new username, and new password.
   * @param {Response} res - The response object to send the result of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async update(req: Request, res: Response) {
    try {
      const { id, email, phone, username, password, role, farms, status } = req.body;
      const user = await User.findById(id);
      if (!user) {
        throw new Error("El usuario no existe");
      }

      const userExist = await User.findOne({ email });
      if (userExist && userExist.id !== id) {
        return res.status(400).json({ error: "El usuario ya existe" });
      }

      const salt = bcryp.genSaltSync();
      user.password = bcryp.hashSync(password, salt);

      const userUpdate = await User.findByIdAndUpdate(
        user.id,
        { email, username, password: user.password, phone, role, farms, status },
        { new: true }
      );

      if (!userUpdate) {
        return res.status(400).json({ error: "Registro fallido" });
      }

      return res
        .status(200)
        .json({ msg: "Usuario actualizado con éxito", user: userUpdate });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Registro fallido" });
    }
  },

  /**
   * Retrieves all users from the database and returns them as a JSON response.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find().populate("farms");

      // Send the user records as a JSON response
      res.status(200).json({ data:users });
    } catch (error) {
      // Log the error and send an error response if retrieving the users fails
      console.log(error);
      res.status(400).json({ error: "Error al obtener los usuarios" });
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findById(id).populate("farms");

      if (!user) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }

      if(user.role == Roles.ADMIN){
        user.farms = await Farm.find({status: true});
      }
      
      return res.status(200).json({ data: user });
    }
    catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Error al obtener el usuario" });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.params;
      console.log(email);

      const user = await User.findOne({ email });

      if (!user)
        return res.status(200).json({
          msg:
            "Continue el proceso en el enlace enviado a su correo " + email,
        });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD_APP_EMAIL,
        },
      });

      const token = webToken.generateTokenTemp(user);

      const enlace = process.env.DOMAIN_URL + "/#/new-password/" + token;
      const colorPrimary = "#39a900"

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Recuperación de Contraseña",
        html:
          `<div
          style="
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
            max-width: 600px;
            width: 100%;
            overflow-y: auto;
          "
        >
          <div style="background-color: ${colorPrimary}; color: #fff; height: 2rem;">
            
          </div>
      
          <div style="padding: 0 2rem">
            <h1 style="font-size: 1.5rem; font-weight: bold; margin: 2rem; color: #333">
              Recuperación de Contraseña
            </h1>
            <p style="color: #333">
              Hemos recibido una solicitud para restablecer la contraseña de tu
              cuenta. Si no has sido tú quien lo ha solicitado, puede que alguien este
              intentando acceder a tu cuenta.
            </p>
            <div style="margin: 1.5rem">
            <a
            href="${enlace}"
            style="
              background-color: ${colorPrimary};
              color: #fff;
              border-radius: 5px;
              color: #fff;
              border: none;
              border-radius: 4px;
              padding: 10px 20px;
              cursor: pointer;
              text-decoration: none;
            ">
              Restablecer Contraseña
            </a>
            </div>
            <p style="color: #333">
              Si el botón no funciona, copia y pega el siguiente enlace en tu
              navegador:
            </p>
            <a href="${enlace}" style="color: #2196f3">
              ${enlace}
            </a>
          </div>
      
          <div style="padding-bottom: 1rem; color: #333">
            <p>Este enlace expirará en 1 hora.</p>
          </div>
          <div style="background-color: ${colorPrimary}; color: #fff; height: 2rem;">

        </div>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            success: false,
            error: "Error al enviar el correo electrónico.",
          });
        } else {
          console.log("Correo electrónico enviado: " + info.response);
          return res.status(200).json({
            success: true,
            msg:
              "Continue el proceso en el enlace enviado a su correo " +
              email,
          });
        }
      });
    } catch (error) {
      console.log(error);

      return res
        .status(400)
        .json({ error: "Error al solicitar cambio de contraseña" });
    }
  },

  async putNewPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;
      const userReq = req.user;

      // Generate salt and hash the password
      const salt = await bcryp.genSalt(10);
      const cryptoPassword = await bcryp.hash(password, salt);

      const user = await User.findByIdAndUpdate(
        userReq.id,
        { password: cryptoPassword },
        { new: true }
      );
      if (!user) {
        return res.status(400).json({ error: "Error al cambiar contraseña" });
      }

      return res
        .status(200)
        .json({ msg: "Contraseña actualizada correctamente", data:user });
    } catch (error) {
      console.error(error);

      return res
        .status(400)
        .json({ error: "Error al solicitar cambio de contraseña" });
    }
  },
};

export { usersController };
