import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';

import { User } from '../../../auth/user/entity/user.entity';
import { Message } from '../../../__generated__/resolvers-types';

// type Message = {
//   from: number;
//   content: string;
// };

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToMany(() => User)
  @JoinTable()
  users: User[]

  @Column('jsonb', { nullable: false })
  messages: Message[]
}