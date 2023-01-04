import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getUserWithPassword(username: string) {
    const user = await this.usersRepository.findOne({
      select: [
        'id',
        'createdAt',
        'updatedAt',
        'username',
        'about',
        'avatar',
        'email',
        'password',
      ],
      where: { username: username },
    });

    if (user) {
      return user;
    }
    throw new NotFoundException('Пользователя c таким username не существует');
  }

  async create(userInformation: CreateUserDto) {
    const hash = await bcrypt.hash(userInformation.password, 10);
    const { id, username, about, avatar, email, createdAt, updatedAt } =
      await this.usersRepository.save({ ...userInformation, password: hash });

    return { id, username, about, avatar, email, createdAt, updatedAt };
  }

  async findByUsername(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });
    if (user) {
      return user;
    }
    throw new NotFoundException('Пользователя c таким username не существует');
  }

  async findByEmail(userEmail: string) {
    const { id, username, about, avatar, email, createdAt, updatedAt } =
      await this.findOne({ where: { email: userEmail } });

    return { id, username, about, avatar, email, createdAt, updatedAt };
  }

  findOne(query) {
    console.log('my findOne');
    return this.usersRepository.findOne(query);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const isHasUser =
      (updateUserDto?.username || updateUserDto?.email) &&
      (await this.findOne({
        where: [
          { username: updateUserDto.username },
          { email: updateUserDto.email },
        ],
      }));

    if (isHasUser) {
      throw new ConflictException('Такой пользователь уже существует');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.usersRepository.update(id, updateUserDto);
    const newUser = await this.findOne({ where: { id } });
    const { password, ...result } = newUser;
    return result;
  }

  async getMyWishes(userId: number) {
    const wishes = await this.usersRepository.find({
      where: { id: userId },
      relations: ['wishes'],
    });
    return wishes[0].wishes;
  }

  async getUserWishes(username: string) {
    const user = await this.findByUsername(username);
    const wishes = await this.usersRepository.find({
      where: { id: user.id },
      relations: ['wishes'],
    });

    return wishes[0].wishes;
  }
}
