import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(req.user.id, createTagDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req) {
    return this.tagsService.findAll(req.user.id);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Req() req, @Param('id') id: string) {
    return this.tagsService.findOne(req.user.id, id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(req.user.id, id, updateTagDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req, @Param('id') id: string) {
    return this.tagsService.remove(req.user.id, id);
  }

  @Post('/:tagId/tasks/:taskId')
  @HttpCode(HttpStatus.CREATED)
  async attachToTask(
    @Req() req,
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.attachToTask(req.user.id, tagId, taskId);
  }

  @Delete('/:tagId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async detachFromTask(
    @Req() req,
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.detachFromTask(req.user.id, tagId, taskId);
  }
}
