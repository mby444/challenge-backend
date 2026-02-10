import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name (must be unique per user)',
    example: 'Urgent',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
