import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindByQuery {
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username: string;
}
