import { Request, Response } from "express";
import SensorsDB from "../models/sensorsDB";

const sensorsDBController = {
  /**
   * Creates a new sensor in the database.
   *
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  async create(req: Request, res: Response) {
    try {
      const { name, type, farm } = req.body;

      const sensor = new SensorsDB({ name, type, farm });

      await sensor.save();

      res.status(200).json({ sensor, message: "Registro exitoso" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Registro fallido" });
    }
  },

  /**
   * Updates a sensors information in the database.
   *
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  async update(req: Request, res: Response) {
    try {
      const { id, name, type, farm, status } = req.body;
      const sensor = await SensorsDB.findById(id);
      if (!sensor) {
        throw new Error("El sensor no existe");
      }

      console.log(status)

      const sensorUpdate = await SensorsDB.findByIdAndUpdate(
        sensor.id,
        {
          name,
          type,
          farm,
          status
        },
        { new: true }
      );

      if (!sensorUpdate) {
        return res.status(400).json({ error: "Registro fallido" });
      }

      return res
        .status(200)
        .json({ msg: "Sensor actualizado con éxito", sensor: sensorUpdate });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Registro fallido" });
    }
  },

  /**
   * Retrieves all sensors from the database and returns them as a JSON response.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async getSensors(req: Request, res: Response): Promise<void> {
    try {
      const sensors = await SensorsDB.find().populate("farm");

      // Send the sensor records as a JSON response
      res.status(200).json({ data: sensors });
    } catch (error) {
      // Log the error and send an error response if retrieving the sensors fails
      console.log(error);
      res.status(400).json({ error: "Error al obtener los sensores" });
    }
  },
};

export { sensorsDBController };
