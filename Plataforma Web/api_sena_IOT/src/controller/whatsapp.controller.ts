import { Request, Response } from "express";
import Farm from "../models/farms";
import User from "../models/users";
import SensorsDB from "../models/sensorsDB";
import { clientWhatsapp } from "../config/whatsapp";

async function sendWhatsAppMessagePeople(
  phone: string,
  type?: string,
  message?: string
) {
  let chatId = null;
  if (type == "group") {
    chatId = `${phone}@g.us`;
  } else {
    chatId = `57${phone}@c.us`;
  }

  if (!message) {
    message = "Parece que el café está listo para ser tratado";
  }
  await clientWhatsapp.sendMessage(chatId, message);
}

const whatsappController = {
  async getIdGroup(req: Request, res: Response) {
    try {
      const nameGroup: string = req.query.nameGroup!.toString();
      const chats = await clientWhatsapp?.getChats();

      if (!chats || chats.length == 0) {
        return res.status(400).json({ error: "No se encontraron chats" });
      }

      const chat = chats?.find(
        (chat) => chat.name === nameGroup.trim() && chat.isGroup
      );
      if (!chat) {
        return res.status(400).json({ error: "No se encontró el grupo" });
      }

      return res.status(200).json({ id: chat.id._serialized });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ error: "Error al obtener el id del grupo" });
    }
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const type = req.body?.type;
      const sensor = req.body?.i;

      console.log(req.body);


      if (type != "people" && type != "group") {
        return res.status(400).json({ error: "El tipo de envio no es valido" });
      }

      if(!sensor) {
        return res.status(400).json({ error: "El id del sensor es requerido" });
      }

      const sensorDB = await SensorsDB.findOne({name: req.body.i}).populate("farm");

      const usersDb = await User.find({ farms: sensorDB?.farm?._id });
      if (!usersDb) {
        return res.status(400).json({ error: "Usuarios no encontrados" });
      }

      for (const user of usersDb) {
        if (!user.phone) {
          continue;
        }
        console.log(user.phone);
        await sendWhatsAppMessagePeople(user.phone, type, req.body.message);
      }

      return res.status(200).json({ message: "Mensaje enviado correctamente" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Error al enviar el mensaje" });
    }
  },
};

export { whatsappController };
