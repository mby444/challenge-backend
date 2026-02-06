import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Req() req, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(req.user.id, createTagDto);
  }

  @Get()
  async findAll(@Req() req) {
    return this.tagsService.findAll(req.user.id);
  }

  @Get('/:id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.tagsService.findOne(req.user.id, id);
  }

  @Patch('/:id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(req.user.id, id, updateTagDto);
  }

  @Delete('/:id')
  async remove(@Req() req, @Param('id') id: string) {
    return this.tagsService.remove(req.user.id, id);
  }

  @Post('/:tagId/tasks/:taskId')
  async attachToTask(
    @Req() req,
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.attachToTask(req.user.id, tagId, taskId);
  }

  @Delete('/:tagId/tasks/:taskId')
  async detachFromTask(
    @Req() req,
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.detachFromTask(req.user.id, tagId, taskId);
  }
}
