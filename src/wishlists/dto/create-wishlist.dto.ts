import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  itemsId: number[];

  @Length(0, 1500)
  @IsOptional()
  description: string;
}
