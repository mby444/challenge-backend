import { IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'Jane Smith',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'User date of birth in ISO 8601 format',
    example: '1998-01-15T00:00:00.000Z',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birth?: Date;
}
