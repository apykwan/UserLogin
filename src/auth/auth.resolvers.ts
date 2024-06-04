import jwt from 'jsonwebtoken';

import { Resolvers } from '../__generated__/resolvers-types';
import { userService } from './user/user.service';

export const authResolvers: Resolvers = {
  Mutation: {
    async signup(parent, { input }, context) {
      const existingUser = await userService.findOneByEmail(input.email);
      const user = await userService.create(input);

      const jwtToken = jwt.sign(
        {
          email: input.email,
          userId: user.id
        },
        process.env.JWT_KEY!,
        { expiresIn: '77 days' }
      ); 
      
      return {
        user,
        jwt: jwtToken
      };
    }
  },
  Query: {
    get: () => "ok"
  }
};