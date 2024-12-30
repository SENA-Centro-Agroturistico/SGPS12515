import { queryClient } from "../database/config";
import { Request, Response } from "express";
import { IQuerySensors } from "../interfaces/querySensors";
import SensorsDB from "../models/sensorsDB";
import { combinationDataHour } from "../functions/groupByHour";
import moment from "moment";
import "moment-timezone";

moment.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
moment.tz.setDefault("America/Bogota");

moment.locale("es");

function daysDate(fecha1: string, fecha2: string): number {
  const startDate = new Date(fecha1).getTime();
  const endDate = new Date(fecha2).getTime();

  const timeDifference = endDate - startDate;
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  return Math.abs(Math.round(daysDifference))+1;
}

async function generateData(fluxQuery: string): Promise<Array<any>> {
  const data = [];

  for await (const { values, tableMeta } of queryClient.iterateRows(
    fluxQuery
  )) {
    const item = tableMeta.toObject(values);

    data.push({
      ...item,
      hour: moment(item.f).format("HH:mm"),
      shortDate: moment(item.f).format("MM/DD"),
    });
  }
  return data;
}

function mergeObject(array: any[]): any[] {
  return array
    .sort((a, b) => moment(a.f).diff(moment(b.f)))
    .reduce((acc, item) => {
      const lastItem = acc[acc.length - 1];
      if (lastItem && moment(item.f).diff(moment(lastItem.f), 'minutes') <= 30) {
        acc[acc.length - 1] = { ...lastItem, ...item };
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as any[]);
}

/**
 * Controller for handling sensor data retrieval.
 */
const sensorsController = {
  /**
   * Retrieves sensor data based on the provided query parameters.
   *
   * @param req - The request object.
   * @param res - The response object.
   * @returns A Promise that resolves to void.
   */
  async getDataSensors(req: Request, res: Response): Promise<any> {
    try {
      const params: IQuerySensors = {
        farm: req.body.farm as string,
        sensor: req.body.sensor as string,
        dateStart: req.body.dateStart as string,
        dateEnd: req.body.dateEnd as string,
        type: req.body.type, // m, d, h, range
        value: req.body.value || 23,
      };

      console.log(params);

      //buscar sensor por nombre de la finca que está relacionado con el sensor
      const sensors = await SensorsDB.find({ farm: params.farm, status: true });

      const sensorDb = sensors.find(
        (s) => s.type == params.sensor?.toString().toUpperCase()
      );

      if (!sensorDb) {
        return res.status(200).json({
          sensor: null,
          data: [],
        });
      }

      let data: any = [];

      const [startDate, endDate] = params.value.toString().split(" - ");
      if (params.type === "range") {
        console.log("range");
        console.log(params.value); // 2024/09/19 - 2024/09/21

        // Separar las fechas de inicio y fin

        console.log("fechas", startDate, endDate)
        const dateStart = moment(startDate, 'YYYY/MM/DD');
        const dateEnd = moment(endDate, 'YYYY/MM/DD');

        while (dateStart <= dateEnd) {
          const startOfDay = dateStart.clone().startOf("day");
          const endOfDay = dateStart.clone().endOf("day");

          let consult = `from(bucket:"my-init-bucket")`;
          if (startOfDay && endOfDay) {
            consult += `|> range(start: ${startOfDay.format()}, stop: ${endOfDay.format()})`;
          }

          if (sensorDb) {
            //console.log("sensors", sensors);

            consult += `|> filter(fn: (r) => r.i == "${sensorDb.name}")`;
          }

          consult += ' |> filter(fn: (r) => r._measurement == "data_sensor")';

          console.log("consult", consult);
          const fluxQuery = consult;

          const arrayData = await generateData(fluxQuery);

          //console.log(arrayData)

          data = [...data, ...arrayData];

          dateStart.add(1, "days");
        }
      } else {
        let start = `-${parseInt(params.value.toString())}${params.type
          .toString()
          .toLowerCase()}`;

        let consult = `from(bucket:"my-init-bucket") |> range(start: ${start}) |> filter(fn: (r) => r._measurement == "data_sensor")`;

        if (params.farm && params.sensor && sensorDb) {
          consult += `|> filter(fn: (r) => r.i == "${sensorDb.name}")`;
        }

        const fluxQuery = consult;

        data = await generateData(fluxQuery);
      }

      data.sort((a:any, b:any) => {
        // Convertir las fechas a objetos de Moment.js para una mejor manipulación
        const dateA = moment(a.f);
        const dateB = moment(b.f);
      
        // Comparar las fechas y devolver un número negativo si a < b, positivo si a > b, y 0 si son iguales
        return dateA.diff(dateB);
      });

      // Send the user records as a JSON response
      return res.status(200).json({
        sensor: sensorDb || null,
        data,
      });
    } catch (error) {
      // Log the error and send an error response if retrieving the users fails
      console.log(error);
      res.status(400).json({ error: "Error al obtener la información" });
    }
  },

    getDataReport: async (req: Request, res: Response) => {
      try {
        const params: IQuerySensors = {
          farm: req.body.farm as string,
          dateStart: req.body.dateStart as string,
          dateEnd: req.body.dateEnd as string,
          type: req.body.type, // m, d, h, range
          value: req.body.value || 23,
        };
  
        console.log(params); // 2024/09/19 - 2024/09/21
  
        // Buscar los sensores de la finca
        const sensors = await SensorsDB.find({ farm: params.farm });

      if (sensors.length === 0) {
        return res.status(200).json([]);
      }
  
        if (sensors.length === 0) {
          return res.status(200).json([]);
        }
  
        const start = moment(params.dateStart, "YYYY/MM/DD");
        const end = moment(params.dateEnd, "YYYY/MM/DD");
  
        //formar el objeto de respuesta por cada mes y el último dato de los días
        const dataGroupByMonth: any = [];
        let isEmpty = true

        while (start <= end) {
          const startOfDay = start.clone().startOf("day");
          const endOfDay = start.clone().endOf("day");
  
          let consult = `from(bucket:"my-init-bucket")`;
          if (startOfDay && endOfDay) {
            consult += `|> range(start: ${startOfDay.format()}, stop: ${endOfDay.format()})`;
          }
  
          if (sensors && sensors.length > 0) {
            // Filtrar por cualquiera de los sensores de la finca
            const sensorFilters = sensors
            .map((sensor) => `r.i == "${sensor.name}"`)
            .join(" or ");

            consult += `|> filter(fn: (r) => ${sensorFilters})`;

          }
  
          consult += ' |> filter(fn: (r) => r._measurement == "data_sensor")';
          console.log(consult)
  
          const fluxQuery = consult;

          const arrayData = await generateData(fluxQuery);
          const arrayFusion = mergeObject(arrayData)
          
          arrayFusion.sort((a, b) => {
            // Convertir las fechas a objetos de Moment.js para una mejor manipulación
            const dateA = moment(a.f);
            const dateB = moment(b.f);
          
            // Comparar las fechas y devolver un número negativo si a < b, positivo si a > b, y 0 si son iguales
            return dateA.diff(dateB);
          });
  
          const month = start.format("MMMM");
          const numberMonth = start.format("MM");
          const key = `${numberMonth}-${start.year()}`;
  
          if (!dataGroupByMonth[key]) {
            dataGroupByMonth[key] = {
              nameMonth: month,
              numberMonth,
              data: [],
            };
          }
  
          let data = {
            date: start.format("DD/MM/YYYY"),
            masa: 0, 
            humidity: 0, 
            temperature: 0, 
            humfinal: 0
          };

          arrayFusion.forEach((item, i)=>{
            isEmpty = false

            if(item.m && item.h && item.t && item.chf){
              data = {
                date: start.format("DD/MM/YYYY"),
                masa: parseFloat(item.m),
                humidity: parseFloat(item.h),
                temperature: parseFloat(item.t),
                humfinal: parseFloat(item.chf)
              };
            }
          })
  
          dataGroupByMonth[key].data.push(data);
  
          start.add(1, "days");
        }
  
        let array = Object.values(dataGroupByMonth);
  
        array.forEach((month: any) => {
          month.data.sort((a: { date: string }, b: { date: string }) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
        });

        if(isEmpty) array= []
  
        // Send the user records as a JSON response
        res.status(200).json(array);
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Error al obtener la información" });
      }
    },

  sendSocket: async (req: Request, res: Response) => {
    try {
      console.log("sendSocket");
      console.log(req.body);

      const data = req.body;

      if (data && data.length > 0) {
        const sensor = data[1].i || null;
        const findSensor = await SensorsDB.findOne({
          name: sensor,
        }).populate("farm");

        if (findSensor) {
          global.io.emit("update", {
            farm: findSensor?.farm?._id || null,
            sensor: findSensor.name,
          });
          return res.status(200).json({ message: "Mensaje enviado" });
        }

        return res.status(400).json({ error: "Error al enviar el mensaje" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: "Error al enviar el mensaje" });
    }
  },
};

export { sensorsController };
