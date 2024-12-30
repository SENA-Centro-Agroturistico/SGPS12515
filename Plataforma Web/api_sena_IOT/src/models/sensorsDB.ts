import { Schema, model } from "mongoose";

const sensorSchema = new Schema({
  name: { type: String, require: true, trim: true, uppercase: true },
  type: { type: String, require: true, trim: true, uppercase: true },
  farm: { type: Schema.Types.ObjectId, ref: "Farm", require: true},
  status: { type: Boolean, default: true },
}, {
  timestamps: true,
  versionKey: false
});

export default model("Sensor", sensorSchema);