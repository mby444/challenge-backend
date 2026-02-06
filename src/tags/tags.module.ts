import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [TasksModule],
  providers: [TagsService],
  controllers: [TagsController],
})
export class TagsModule {}
