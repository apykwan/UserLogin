import { ApolloServer, ExpressContext } from 'apollo-server-express';
import { mergeResolvers } from '@graphql-tools/merge';
import express from 'express';
import http from 'http';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import { AppDataSource } from './app-data.source';
import { roomResolvers } from './rooms/room.resolvers';
import { authResolvers } from './auth/auth.resolvers';
import { Room } from './rooms/room/entity/room.entity';
import { Resolvers, JwtPayload } from './__generated__/resolvers-types';

export interface MyContext extends ExpressContext {
  currentUser: JwtPayload;
  authorized: boolean;
  io: Server
}

export class AppModule {
  constructor(public resolvers: Resolvers) {}

  async startApollo(): Promise<{ httpServer: http.Server, server: ApolloServer<MyContext> }> {
    const appDataSource = await AppDataSource.initialize();
    const app = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "http://127.0.0.1:5500"
      }
    });

    io.on('connection', (socket) => {
      app.request.socketIo = socket;
    });

    const typeDefs = readFileSync('schema.graphql', { encoding: 'utf-8'});
    const server = new ApolloServer({
      resolvers: this.resolvers,
      typeDefs,
      introspection: true, 
      context: async ({ req, res }) => {
        let payload;

        try {
          payload = jwt.verify(req.headers.authorization || '', process.env.JWT_KEY!);
        } catch (err) {
          payload = null;
        }

        if (typeof payload !== 'string' && payload) {
          const rooms = await appDataSource.getRepository(Room)
            .createQueryBuilder('room')
            .innerJoin('room.users', 'u')
            .where('u.id = :id', { id: Number(payload.userId) })
            .getMany();

          const roomsIds = rooms.map(room => `${room.id}`);
          req.socketIo?.join(roomsIds);
        }
        
        return {
          currentUser: payload,
          io,
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

export const appModule = new AppModule(
  mergeResolvers([authResolvers, roomResolvers])
);