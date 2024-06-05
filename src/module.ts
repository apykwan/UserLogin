import { ApolloServer, ExpressContext } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';

import { AppDataSource } from './app-data.source';
import { authResolvers } from './auth/auth.resolvers';
import { Resolvers, JwtPayload } from './__generated__/resolvers-types';

export interface MyContext extends ExpressContext {
  currentUser: JwtPayload;
  authorized: boolean;
}

export class AppModule {
  constructor(public resolvers: Resolvers) {}

  async startApollo(): Promise<{ httpServer: http.Server, server: ApolloServer<MyContext> }> {
    await AppDataSource.initialize();
    const app = express();
    const httpServer = http.createServer(app);

    const typeDefs = readFileSync('schema.graphql', { encoding: 'utf-8'});
    const server = new ApolloServer({
      resolvers: this.resolvers,
      typeDefs,
      context: ({ req, res }) => {
        let payload;

        try {
          payload = jwt.verify(req.headers.authorization || '', process.env.JWT_KEY!);
        } catch (err) {
          payload = null;
        }
        
        return {
          currentUser: payload,
          req,
          authorized: !!payload
        };
      } 
    });
    await server.start();
    server.applyMiddleware({ app });

    return { httpServer, server };
  }
}

export const appModule = new AppModule(authResolvers);