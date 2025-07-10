import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "./db.js";
const JWT_SECRET = "supersecret_key"; // تقدر تغيره وتحفظه بالبيئة (env)

export const resolvers = {
  Query: {
    users: async () => {
      return await UserModel.find();
    },
    me: async (_, __, { user }) => {
      return user; // رح نضبطها لاحقًا لما نضيف مصادقة
    },
  },

  Mutation: {
    signup: async (_, args) => {
      const { email, password, displayName } = args;
      try {
        const userExist = await UserModel.findOne({ email });

        if (userExist) {
          throw new Error("Email already in use");
        }
        const SALT = 10;
        const lowerEmail = email.toLowerCase();
        const hashedPassword = await bcrypt.hash(password, SALT);

        const newUser = new UserModel({
          email: lowerEmail,
          password: hashedPassword,
          displayName,
          score: 0,
          status: "OFFLINE",
        });

        await newUser.save();
        return newUser;
      } catch (err) {
        console.log("Error:", err);
      }
    },
    login: async (_, args) => {
      const { email, password } = args;
      try {
        const validUser = await UserModel.findOne({ email });

        if (!validUser) {
          throw new Error("Email or password is incorrect");
        }

        const validPassword = await bcrypt.compare(
          password,
          validUser.password
        );
        if (!validPassword) {
          throw new Error("Email or password is incorrect");
        }
        const payload = {
          userId: validUser._id,
        };
        const options = {
          expiresIn: "60m",
        };
        const token = jwt.sign(payload, JWT_SECRET, options);
        validUser.status = "ONLINE";
        await validUser.save();
        return {
          token,
          user: validUser,
        };
      } catch (err) {
        console.log("Error:", err);
      }
    },
  },
};
