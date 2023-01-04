import { UsersService } from './../users/users.service';
import { Injectable, UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from './local-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    console.log('here2');
    const userInformation = await this.usersService.getUserWithPassword(
      username,
    );

    const isMatch = await bcrypt.compare(password, userInformation.password);

    if (userInformation && isMatch) {
      const { password, ...result } = userInformation;
      console.log('result: ', result);
      return result;
    }
    return null;
  }

  @UseGuards(LocalAuthGuard)
  async signin(user: any) {
    console.log(user.id);
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
