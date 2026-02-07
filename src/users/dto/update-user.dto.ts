import { IsOptional, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsDateString()
  birth?: Date;
}
