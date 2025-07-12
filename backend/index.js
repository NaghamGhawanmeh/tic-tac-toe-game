import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";

import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import "./db.js";

const app = express();
const httpServer = http.createServer(app);

// ✅ نعمل السكيم جاهز لكل من ApolloServer و WebSocket
const schema = makeExecutableSchema({ typeDefs, resolvers });

// ✅ نجهز WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// ✅ connect subscriptions logic
const serverCleanup = useServer({ schema }, wsServer);

// ✅ نجهز Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// ✅ start
await server.start();

app.use(
  "/graphql",
  cors({ origin: "http://localhost:3000", credentials: true }),
  bodyParser.json(),
  expressMiddleware(server)
);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
});
