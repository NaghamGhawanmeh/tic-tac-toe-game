export const typeDefs = `#graphql

type User {
  id: ID!
  displayName: String!
  email: String!
  score: Int!
  status: UserStatus!
}

enum UserStatus {
  ONLINE
  OFFLINE
  PLAYING
}

type AuthPayload {
  token: String!
  user: User!
}

type Query {
  users: [User!]!       
  me: User              
}

type Mutation {
  signup(displayName: String!, email: String!, password: String!): User
  login(email: String!, password: String!): AuthPayload
}

`;
