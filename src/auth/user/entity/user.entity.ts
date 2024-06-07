import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: false })
  @IsEmail()
  email: string;

  @Column({ select: false })
  @MinLength(6)
  password: string;
}