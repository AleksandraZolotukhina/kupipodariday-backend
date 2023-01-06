import { UsersService } from './../users/users.service';
import { Injectable, UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const userInformation = await this.usersService.getUserWithPassword(
      username,
    );

    const isMatch = await bcrypt.compare(password, userInformation.password);

    if (userInformation && isMatch) {
      const { password, ...result } = userInformation;
      return result;
    }
    return null;
  }

  @UseGuards(LocalAuthGuard)
  async signin(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
    };
  }
}
