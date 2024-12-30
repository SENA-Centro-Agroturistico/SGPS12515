import { Roles } from "../interfaces/rolesInterface";
import User from "../models/users";
import bcryp from "bcryptjs";

const init = {
  async createUser() {
    try {
      const user = new User({
        username: "ADMIN",
        password: process.env.USER_PASS || "admin",
        role: Roles.ADMIN,
        email: process.env.USER_NAME || "admin@gmail.com",
        phone: "3508848389",
      });

      const userExist = await User.findOne({ email: user.email });
      if (userExist) {
        return console.log("User already exists");
      }

      if (user.password) {
        const salt = bcryp.genSaltSync();
        user.password = bcryp.hashSync(user.password, salt);
      }

      await user.save();

      console.log("User created successfully");
    } catch (error) {
      console.log(error);
      console.log("User creation failed");
    }
  },
};


export { init }; 