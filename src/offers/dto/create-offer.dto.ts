import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  itemId: number;

  @IsPositive()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsBoolean()
  @IsNotEmpty()
  hidden: boolean;
}
