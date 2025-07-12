export const typeDefs = `#graphql

type User {
  id: ID!
  displayName: String!
  email: String!
  score: Int!
  status: UserStatus!
}

type Game {
  id: ID!
  playerX: User!
  playerO: User
  board: [String!]!
  currentTurn: String!
  status: GameStatus!
  winner: String
}

enum UserStatus {
  ONLINE
  OFFLINE
  PLAYING
}

enum GameStatus {
  WAITING_FOR_REQUEST
  IN_PROGRESS
  COMPLETED
  REJECTED
}

type AuthPayload {
  token: String!
  user: User!
}

type Query {
  users: [User!]!
  me: User
  games: [Game!]!
  game(id: ID!): Game
}

type Mutation {
  signup(displayName: String!, email: String!, password: String!): User
  login(email: String!, password: String!): AuthPayload
  updateUserStatus(id: ID!, status: UserStatus!): User
  createGame(playerX: ID!, playerO: ID!): Game
  acceptGameRequest(gameId: ID!, playerO: ID!): Game
  rejectGameRequest(gameId: ID!): Game
  makeMove(gameId: ID!, index: Int!): Game
}

type Subscription {
  gameUpdated: Game
}
`;
