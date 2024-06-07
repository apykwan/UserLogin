import { GraphQLError } from 'graphql';

import { userService } from '../auth/user/user.service';
import { roomService } from './room/room.service';
import { Resolvers } from '../__generated__/resolvers-types';

export const roomResolvers: Resolvers = {
  Mutation: {
    async sendMsg(parent, { input }, context) {
      if (!context.authorized) 
        throw new GraphQLError('unAuthorized', { extensions: { code: 'UNAUTHORIZED' }});

      return await roomService.addMessageToRoom(input.roomId, {
        content: input.message,
        from: context.currentUser.userId
      });
    },

    async createRoom(parent, { input }, context) {
      if (!context.authorized) 
        throw new GraphQLError('unAuthorized', { extensions: { code: 'UNAUTHORIZED' }});

      const roomHasUsers = await roomService
        .findRoomWithUsersId(input.receiver, context.currentUser.userId);

      if (roomHasUsers) throw new GraphQLError('Room already exists');

      const participants = await userService.findByIds([context.currentUser.userId, input.receiver]);

      return await roomService.createRoom(participants, {
        content: input.message,
        from: context.currentUser.userId
      })
    }
  }
};