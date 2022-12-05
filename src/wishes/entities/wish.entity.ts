import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Length, IsDate, IsFQDN, IsInt, IsPositive } from 'class-validator';
import { User } from './../../users/entities/user.entity';
import { Offer } from './../../offers/entities/offer.entity';
@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column()
  @Length(1, 250)
  name: string;

  @Column()
  @IsFQDN()
  link: string;

  @Column()
  @IsFQDN()
  image: string;

  @Column({
    type: 'float',
  })
  price: number;

  @Column({
    type: 'float',
  })
  raised: number;

  @ManyToOne(() => User, (user) => user.id)
  owner: User;

  @Column()
  @Length(1, 1024)
  description: string;

  @ManyToOne(() => Offer, (offer) => offer.id)
  offers: Offer[];

  @Column()
  @IsInt()
  @IsPositive()
  copied: number;
}
