import { InfluxDB, HttpError, Point } from '@influxdata/influxdb-client';
import { envs } from "../config/dotenv";

const url = envs.INFLUXDB_URL;
const token = envs.INFLUXDB_TOKEN;
const organizationName = envs.INFLUXDB_ORG;
const bucketName = envs.INFLUXDB_BUCKET;

const client = new InfluxDB({ url, token });
let writeAPI = client.getWriteApi(organizationName, bucketName);
const queryClient = client.getQueryApi(organizationName);

function newInstance() {
  writeAPI = client.getWriteApi(organizationName, bucketName);
}

export { writeAPI, queryClient, client, newInstance };
