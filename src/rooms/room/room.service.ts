import { Repository } from 'typeorm';
import { Server } from 'socket.io';

import { Room } from './entity/room.entity';
import { User } from '../../auth/user/entity/user.entity';
import { AppDataSource } from '../../app-data.source';
import { Message } from '../../__generated__/resolvers-types';

// type Message = {
//   from: number;
//   content: string;
// };

export class RoomService {
  constructor(public roomRepository: Repository<Room>) {}

  async getAllRooms(userId: number) {
    const queryBuilder = this.roomRepository.createQueryBuilder('room');

    return await queryBuilder
      .innerJoin('room.users', 'u')
      .where('u.id = :id', { id: userId })
      .getMany();
  }

  async addMessageToRoom(roomId: number, message: Message, io?: Server) {
    const queryBuilder = this.roomRepository.createQueryBuilder();
    await queryBuilder.update(Room, { 
      messages: () => `messages || '${JSON.stringify(message)}'::jsonb`
    })
      .where("id = :id", { id: roomId })
      .execute()

    if (io) {
      io.to(`${roomId}`).emit('message', {
        message,
        roomId
      });
    }
    
    return await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users']
    });
  }

  async createRoom(participants: Array<User>, message: Message) {
    const room = this.roomRepository.create({
      users: participants,
      messages: [message]
    });

    return await this.roomRepository.save(room);
  }

  async findRoomWithUsersId(receiverId: number, senderId: number) {
    const queryBuilder = this.roomRepository.createQueryBuilder('room');

    // Fetch rooms where both the sender and receiver are users
    const rooms = await queryBuilder
      .innerJoin('room.users', 'sender', 'sender.id = :senderId', { senderId })
      .innerJoin('room.users', 'receiver', 'receiver.id = :receiverId', { receiverId })
      .getMany();

    // Return true if any rooms are found, false otherwise
    return rooms.length > 0;
  }
}

export const roomService = new RoomService(AppDataSource.getRepository(Room));
