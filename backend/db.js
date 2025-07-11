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
    default: null,
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
    enum: [
      "WAITING",
      "IN_PROGRESS",
      "FINISHED",
      "WAITING_FOR_REQUEST",
      "COMPLETED",
      "REJECTED",
    ],
    default: "WAITING",
  },
  winner: {
    type: String,
    enum: ["X", "O", "DRAW", null],
    default: null,
  },
});

// ✅ تأكد إنك تكتبها هكذا حتى تتحول _id ل String في الردود
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // لو ما بدك تبينه
    return ret;
  },
});

gameSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UserModel = mongoose.model("User", userSchema);
export const GameModel = mongoose.model("Game", gameSchema);
