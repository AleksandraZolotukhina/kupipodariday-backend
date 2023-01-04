import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindByEmail {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
