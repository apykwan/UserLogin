import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { readFileSync } from 'fs';

import { authResolvers } from './auth/auth.resolvers';
import { Resolvers } from './__generated__/resolvers-types';

export class AppModule {
  constructor(public resolvers: Resolvers) {}

  async startApollo(): Promise<{ httpServer: http.Server, server: ApolloServer }> {
    const app = express();
    const httpServer = http.createServer(app);

    const typeDefs = readFileSync('schema.graphql', { encoding: 'utf-8'});
    const server = new ApolloServer({
      resolvers: this.resolvers,
      typeDefs 
    });
    await server.start();
    server.applyMiddleware({ app });

    return { httpServer, server };
  }
}

export const appModule = new AppModule(authResolvers);