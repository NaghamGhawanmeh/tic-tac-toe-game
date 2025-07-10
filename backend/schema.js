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
  status: String!
  winner: String
}

# =============
enum UserStatus {
  ONLINE
  OFFLINE
  PLAYING
}

type AuthPayload {
  token: String!
  user: User!
}
#==============
type Query {
  users: [User!]!       
  me: User   
  games: [Game!]!
  game(id: ID!): Game           
}

type Mutation {
  signup(displayName: String!, email: String!, password: String!): User
  login(email: String!, password: String!): AuthPayload
  
  createGame(playerX: ID!): Game
  joinGame(gameId: ID!, playerO: ID!): Game
  makeMove(gameId: ID!, index: Int!): Game
}

`;
