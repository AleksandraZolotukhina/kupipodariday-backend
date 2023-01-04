import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindByEmail } from './dto/find-by-email.dto';
import { JwtGuard } from 'src/auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findOne(@Request() req) {
    return req.user;
  }

  @Patch('me')
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+req.user.id, updateUserDto);
  }

  //correct
  @Post('find')
  findByEmail(@Query() query: FindByEmail) {
    return this.usersService.findByEmail(query.email);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findOne({ where: { username: username } });
  }

  @Get('me/wishes')
  getMyWishes(@Request() req) {
    return this.usersService.getMyWishes(req.user.id);
  }

  @Get(':username/wishes')
  getUserWishes(@Param('username') username: string) {
    return this.usersService.getUserWishes(username);
  }
}
