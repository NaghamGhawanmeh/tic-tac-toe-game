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

const gameSchema = new mongoose.Schema({
  playerX: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  playerO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  board: {
    type: [String],
    default: ["", "", "", "", "", "", "", "", ""],
  },
  currentTurn: {
    type: String,
    enum: ["X", "O"],
    default: "X",
  },
  status: {
    type: String,
    enum: ["WAITING", "IN_PROGRESS", "FINISHED"],
    default: "WAITING",
  },
  winner: {
    type: String,
    enum: ["X", "O", "DRAW", null],
    default: null,
  },
});
export const UserModel = mongoose.model("User", userSchema);
export const GameModel = mongoose.model("Game", gameSchema);
