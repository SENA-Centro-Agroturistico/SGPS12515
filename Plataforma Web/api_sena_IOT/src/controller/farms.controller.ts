import { Request, Response } from "express";
import Farm from "../models/farms";

const farmsController = {
  /**
   * Creates a new farm in the database.
   *
   * @param {Request} req - The request object containing the farm's farmname and password.
   * @param {Response} res - The response object to send the result of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async create(req: Request, res: Response) {
    try {
      const { owner, name, city, department, address, codeFarm } = req.body;

      const nameExist = await Farm.findOne({ name });
      if (nameExist) {
        return res.status(400).json({ error: `La finca "${name}" ya existe` });
      }

      const farm = new Farm({
        owner,
        name,
        city,
        department,
        address,
        codeFarm,
      });

      await farm.save();

      res.status(200).json({ farm, message: "Registro exitoso" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Registro fallido" });
    }
  },

  /**
   * Updates a farm's information in the database.
   *
   * @param {Request} req - The request object containing the farm's id, old farmname, new farmname, and new password.
   * @param {Response} res - The response object to send the result of the operation.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async update(req: Request, res: Response) {
    try {
      const { id, owner, name, city, department, address, codeFarm, status } =
        req.body;
      const farm = await Farm.findById(id);
      if (!farm) {
        return res.status(400).json({ error: "La finca no existe" });
      }

      const farmExist = await Farm.findOne({ codeFarm });
      if (farmExist && farmExist.id !== id) {
        return res.status(400).json({ error: "La finca ya existe" });
      }

      const farmUpdate = await Farm.findByIdAndUpdate(
        farm.id,
        { owner, name, city, department, address, codeFarm, status },
        { new: true }
      );

      if (!farmUpdate) {
        return res.status(400).json({ error: "Registro fallido" });
      }

      return res
        .status(200)
        .json({ msg: "Finca actualizada con éxito", farm: farmUpdate });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Registro fallido" });
    }
  },

  /**
   * Retrieves all farms from the database and returns them as a JSON response.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async getFarms(req: Request, res: Response): Promise<void> {
    try {
      const farms = await Farm.find();

      // Send the farm records as a JSON response
      res.status(200).json({ data: farms });
    } catch (error) {
      // Log the error and send an error response if retrieving the farms fails
      console.log(error);
      res.status(400).json({ error: "Error al obtener las fincas" });
    }
  },

};

export { farmsController };
