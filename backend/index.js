import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";

import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import "./db.js";

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// ✅ middlewares
app.use(
  "/graphql",
  cors({ origin: "http://localhost:3000", credentials: true }),
  bodyParser.json(), // ✅ خليها جوا نفس المسار
  expressMiddleware(server)
);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});
