let clientWhatsapp: Client;
import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";

const whatsappConnection = async () => {
  try {
    clientWhatsapp = new Client({
      webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      },
    });

    clientWhatsapp.on("qr", (qr: any) => {
      console.log("QR RECEIVED", qr);
      qrcode.generate(qr, { small: true });
    });

    clientWhatsapp.on("ready", () => {
      console.log("Client is ready!");
    });

    clientWhatsapp.initialize();
  } catch {
    console.log("Error connecting to whatsapp");
    setTimeout(() => {
      whatsappConnection();
    }, 5000);
  }
};

export { whatsappConnection, clientWhatsapp };
