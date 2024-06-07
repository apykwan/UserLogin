import { GraphQLError } from 'graphql';
import { In, Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';
import bcrypt from 'bcrypt';

import { User } from './entity/user.entity';
import { SignupInput } from '../../__generated__/resolvers-types';
import { AppDataSource } from '../../app-data.source';

export class UserService {
  constructor(public userRepository: Repository<User>) {}

  async create(signupInput: SignupInput) {
    const user = this.userRepository.create(signupInput);

    try {
      await validateOrReject(user);

      user.password = await bcrypt.hash(signupInput.password, 10);
      return await this.userRepository.save(user);
    } catch (errors) {
      throw new GraphQLError('validation error', {
        extensions: {
          errors,
          code: 'BAD_USER_INPUT'
        }
      });
    }
  }

  async findOneByEmail(email: string) {
    // return await this.userRepository.findOneBy({ email });
    const user = this.userRepository
      .createQueryBuilder('user')
      .select('user')
      .addSelect('user.password')
      .where('email = :email', { email})
      .getOne();
    
    return user;
  }

  async findByIds(ids: Array<number>) {
    return await this.userRepository.findBy({ id: In(ids) })
  }
}

export const userService = new UserService(AppDataSource.getRepository(User));