import * as env from "env-var";
import dotenv from "dotenv";

dotenv.config({
    path: ".env",
})

const envs = {
    INFLUXDB_URL: env.get("INFLUXDB_URL").required().asString(),
    INFLUXDB_USERNAME: env.get("INFLUXDB_USERNAME").required().asString(),
    INFLUXDB_PASSWORD: env.get("INFLUXDB_PASSWORD").required().asString(),
    INFLUXDB_ORG: env.get("INFLUXDB_ORG").required().asString(),
    INFLUXDB_BUCKET: env.get("INFLUXDB_BUCKET").required().asString(),
    INFLUXDB_TOKEN: env.get("INFLUXDB_TOKEN").required().asString(),
    JWT_SECRET: env.get("JWT_SECRET").required().asString(),
    JWT_SECRET_TEMP: env.get("JWT_SECRET_TEMP").required().asString()
  };
  

export { envs }