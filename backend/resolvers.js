import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GameModel, UserModel } from "./db.js";
const JWT_SECRET = "supersecret_key";
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
    users: async () => {
      const users = await UserModel.find();
      return users.map((user) => {
        user.id = user._id.toString();
        return user;
      });
    },
    me: async (_, __, { user }) => {
      return user;
    },
    games: async () => {
      const games = await GameModel.find()
        .populate("playerX")
        .populate("playerO");
      return games.map((game) => {
        game.id = game._id.toString();
        if (game.playerX) game.playerX.id = game.playerX._id.toString();
        if (game.playerO) game.playerO.id = game.playerO._id.toString();
        return game;
      });
    },
    game: async (_, args) => {
      const game = await GameModel.findById(args.id)
        .populate("playerX")
        .populate("playerO");
      if (!game) return null;
      game.id = game._id.toString();
      if (game.playerX) game.playerX.id = game.playerX._id.toString();
      if (game.playerO) game.playerO.id = game.playerO._id.toString();
      return game;
    },
  },

  Mutation: {
    signup: async (_, args) => {
      const { email, password, displayName } = args;
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
      newUser.id = newUser._id.toString();
      return newUser;
    },

    login: async (_, args) => {
      const { email, password } = args;
      const validUser = await UserModel.findOne({ email });

      if (!validUser) {
        throw new Error("Email or password is incorrect");
      }

      const validPassword = await bcrypt.compare(password, validUser.password);
      if (!validPassword) {
        throw new Error("Email or password is incorrect");
      }

      const payload = { userId: validUser._id };
      const options = { expiresIn: "60m" };
      const token = jwt.sign(payload, JWT_SECRET, options);

      validUser.status = "ONLINE";
      await validUser.save();
      validUser.id = validUser._id.toString();

      return { token, user: validUser };
    },

    updateUserStatus: async (_, { id, status }) => {
      const user = await UserModel.findById(id);
      if (!user) throw new Error("User not found");
      user.status = status;
      await user.save();
      user.id = user._id.toString();
      return user;
    },

    createGame: async (_, args) => {
      const { playerX, playerO } = args;
      const userExist = await UserModel.findById(playerX);
      if (!userExist) throw new Error("Player X not found");
      const receiverExist = await UserModel.findById(playerO);
      if (!receiverExist) throw new Error("Player O not found");

      const board = Array(9).fill("");
      const newGame = new GameModel({
        playerX,
        playerO,
        board,
        currentTurn: "X",
        status: "WAITING_FOR_REQUEST",
      });

      await newGame.save();
      await newGame.populate(["playerX", "playerO"]);

      newGame.id = newGame._id.toString();
      if (newGame.playerX) newGame.playerX.id = newGame.playerX._id.toString();
      if (newGame.playerO) newGame.playerO.id = newGame.playerO._id.toString();

      return newGame;
    },

    acceptGameRequest: async (_, args) => {
      const { gameId, playerO } = args;
      const game = await GameModel.findById(gameId)
        .populate("playerX")
        .populate("playerO");
      if (!game) throw new Error("Game not found");
      if (game.status !== "WAITING_FOR_REQUEST")
        throw new Error("Game is not waiting for a player");

      const user = await UserModel.findById(playerO);
      if (!user) throw new Error("Player O not found");

      game.playerO = playerO;
      game.status = "IN_PROGRESS";
      await game.save();
      await game.populate("playerX").populate("playerO");

      game.id = game._id.toString();
      if (game.playerX) game.playerX.id = game.playerX._id.toString();
      if (game.playerO) game.playerO.id = game.playerO._id.toString();

      return game;
    },

    rejectGameRequest: async (_, args) => {
      const { gameId } = args;
      const game = await GameModel.findById(gameId)
        .populate("playerX")
        .populate("playerO");
      if (!game) throw new Error("Game not found");
      if (game.status !== "WAITING_FOR_REQUEST")
        throw new Error("Game is not waiting for a player");

      game.status = "REJECTED";
      await game.save();

      game.id = game._id.toString();
      if (game.playerX) game.playerX.id = game.playerX._id.toString();
      if (game.playerO) game.playerO.id = game.playerO._id.toString();

      return game;
    },
    makeMove: async (_, { gameId, index }) => {
      const game = await GameModel.findById(gameId);
      if (!game) {
        throw new Error("Game not found");
      }
      if (game.status !== "IN_PROGRESS") {
        throw new Error("Game is not in progress");
      }
      if (game.board[index] !== "") {
        throw new Error("This cell is already taken");
      }

      // حدد الرمز الحالي
      const currentSymbol = game.currentTurn;

      // حدّث الـ board
      game.board[index] = currentSymbol;

      // تحقق إذا في فائز
      const winner = checkWinner(game.board);
      if (winner) {
        game.status = "COMPLETED";
        game.winner = winner === "DRAW" ? "DRAW" : currentSymbol;
      } else {
        // غير الدور
        game.currentTurn = currentSymbol === "X" ? "O" : "X";
      }

      await game.save();
      return game;
    },
  },
};
