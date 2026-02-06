import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';

@Module({
  imports: [],
  providers: [TagsService],
  controllers: [TagsController],
})
export class TagsModule {}
