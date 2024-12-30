import { Schema, model } from "mongoose";

const usersSchema = new Schema({
  username: { type: String, required: true, trim: true, uppercase: true},
  email: { type: String, required: true,trim: true, uppercase: true, unique: true },
  phone: { type: String, trim: true},
  password: { type: String, require: true, trim: true, select: false },
  role: { type: String, require: true },
  farms: [{ type: Schema.Types.ObjectId, ref: "Farm" }],
  status: { type: Boolean, default: true },
},{
  timestamps: true,
  versionKey: false,
});

export default model("User", usersSchema);
