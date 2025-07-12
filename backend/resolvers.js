import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PubSub } from "graphql-subscriptions";
import { GameModel, UserModel } from "./db.js";

const JWT_SECRET = "supersecret_key";
const pubsub = new PubSub();
const GAME_UPDATED = "GAME_UPDATED";

function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== "")) {
    return "DRAW";
  }

  return null;
}

export const resolvers = {
  Query: {
    users: async () => await UserModel.find(),
    games: async () =>
      await GameModel.find().populate("playerX").populate("playerO"),
    game: async (_, { id }) =>
      await GameModel.findById(id).populate("playerX").populate("playerO"),
  },

  Mutation: {
    signup: async (_, { email, password, displayName }) => {
      const exist = await UserModel.findOne({ email });
      if (exist) throw new Error("Email already in use");
      const hashed = await bcrypt.hash(password, 10);
      const user = new UserModel({
        email,
        password: hashed,
        displayName,
        score: 0,
        status: "OFFLINE",
      });
      await user.save();
      return user;
    },
    login: async (_, { email, password }) => {
      const user = await UserModel.findOne({ email });
      if (!user) throw new Error("Invalid credentials");
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid credentials");
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "60m",
      });
      user.status = "ONLINE";
      await user.save();
      return { token, user };
    },
    updateUserStatus: async (_, { id, status }) => {
      const user = await UserModel.findById(id);
      if (!user) throw new Error("User not found");
      user.status = status;
      await user.save();
      return user;
    },
    createGame: async (_, { playerX, playerO }) => {
      const game = new GameModel({
        playerX,
        playerO,
        board: Array(9).fill(""),
        currentTurn: "X",
        status: "WAITING_FOR_REQUEST",
      });
      await game.save();
      await game.populate(["playerX", "playerO"]);
      return game;
    },
    acceptGameRequest: async (_, { gameId, playerO }) => {
      const game = await GameModel.findById(gameId).populate([
        "playerX",
        "playerO",
      ]);
      if (!game) throw new Error("Game not found");
      game.playerO = playerO;
      game.status = "IN_PROGRESS";
      await game.save();
      await game.populate(["playerX", "playerO"]);
      pubsub.publish(`${GAME_UPDATED}_${game._id.toString()}`, {
        gameUpdated: game,
      });
      return game;
    },
    rejectGameRequest: async (_, { gameId }) => {
      const game = await GameModel.findById(gameId).populate([
        "playerX",
        "playerO",
      ]);
      if (!game) throw new Error("Game not found");
      game.status = "REJECTED";
      await game.save();
      pubsub.publish(`${GAME_UPDATED}_${game._id.toString()}`, {
        gameUpdated: game,
      });
      return game;
    },
    makeMove: async (_, { gameId, index }) => {
      const game = await GameModel.findById(gameId).populate([
        "playerX",
        "playerO",
      ]);
      if (!game) throw new Error("Game not found");
      if (game.board[index] !== "" || game.status !== "IN_PROGRESS")
        throw new Error("Invalid move");

      const symbol = game.currentTurn;
      game.board[index] = symbol;

      const winner = checkWinner(game.board);
      if (winner) {
        game.status = "COMPLETED";
        game.winner = winner === "DRAW" ? "DRAW" : symbol;
      } else {
        game.currentTurn = symbol === "X" ? "O" : "X";
      }

      await game.save();
      pubsub.publish(`${GAME_UPDATED}_${game._id.toString()}`, {
        gameUpdated: game,
      });
      return game;
    },
  },

  Subscription: {
    gameUpdated: {
      subscribe: (_, { gameId }) => {
        return pubsub.asyncIterator(`${GAME_UPDATED}_${gameId}`);
      },
    },
  },
};
