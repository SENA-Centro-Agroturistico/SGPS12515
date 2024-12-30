import { Schema, model } from "mongoose";

const farmSchema = new Schema({
  owner: {type: String, require: true, trim: true, uppercase: true},
  name: { type: String, require: true, trim: true, uppercase: true },
  city: { type: String, require: true, trim: true, uppercase: true },
  department: { type: String, require: true, trim: true, uppercase: true },
  address: { type: String, require: true,trim: true, uppercase: true },
  codeFarm: { type: String, require: true, trim: true},
  status: { type: Boolean, default: true },
}, {
  timestamps: true,
  versionKey: false
});

export default model("Farm", farmSchema);