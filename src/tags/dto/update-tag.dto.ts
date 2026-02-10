import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiProperty({
    description: 'Updated tag name',
    example: 'High Priority',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
