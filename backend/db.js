import mongoose from "mongoose";

await mongoose.connect("mongodb://127.0.0.1:27017/tictactoeDB");
console.log("✅ Connected to MongoDB");

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["ONLINE", "OFFLINE", "PLAYING"],
    default: "OFFLINE",
  },
});

export const UserModel = mongoose.model("User", userSchema);
