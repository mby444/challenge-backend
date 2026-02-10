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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Tags')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new tag',
    description:
      'Creates a new tag for the authenticated user. Tag names must be unique per user.',
  })
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    schema: {
      example: {
        id: '850e8400-e29b-41d4-a716-446655440003',
        name: 'Urgent',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2024-01-10T12:00:00.000Z',
        updatedAt: '2024-01-10T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Tag name already exists for this user',
    schema: {
      example: {
        statusCode: 409,
        message: 'Tag name already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async create(@Req() req, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(req.user.id, createTagDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all tags',
    description: 'Retrieves all tags belonging to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully',
    schema: {
      example: [
        {
          id: '850e8400-e29b-41d4-a716-446655440003',
          name: 'Urgent',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-01-10T12:00:00.000Z',
          updatedAt: '2024-01-10T12:00:00.000Z',
        },
        {
          id: '850e8400-e29b-41d4-a716-446655440004',
          name: 'Personal',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-01-09T10:00:00.000Z',
          updatedAt: '2024-01-09T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(@Req() req) {
    return this.tagsService.findAll(req.user.id);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific tag',
    description:
      'Retrieves a specific tag by ID. The tag must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID (UUID)',
    example: '850e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully',
    schema: {
      example: {
        id: '850e8400-e29b-41d4-a716-446655440003',
        name: 'Urgent',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2024-01-10T12:00:00.000Z',
        updatedAt: '2024-01-10T12:00:00.000Z',
        tasks: [],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found or does not belong to user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findOne(@Req() req, @Param('id') id: string) {
    return this.tagsService.findOne(req.user.id, id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a tag',
    description:
      'Updates a specific tag by ID. The tag must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID (UUID)',
    example: '850e8400-e29b-41d4-a716-446655440003',
  })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    schema: {
      example: {
        id: '850e8400-e29b-41d4-a716-446655440003',
        name: 'High Priority',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2024-01-10T12:00:00.000Z',
        updatedAt: '2024-01-11T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found or does not belong to user',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Tag name already exists for this user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(req.user.id, id, updateTagDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a tag',
    description:
      'Permanently deletes a specific tag by ID. The tag must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID (UUID)',
    example: '850e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: 204,
    description: 'Tag deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found or does not belong to user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async remove(@Req() req, @Param('id') id: string) {
    return this.tagsService.remove(req.user.id, id);
  }

  @Post('/:tagId/tasks/:taskId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Attach a tag to a task',
    description:
      'Associates a tag with a task. Both the tag and task must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'tagId',
    description: 'Tag ID (UUID)',
    example: '850e8400-e29b-41d4-a716-446655440003',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID (UUID)',
    example: '750e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 201,
    description: 'Tag successfully attached to task',
    schema: {
      example: {
        id: '850e8400-e29b-41d4-a716-446655440003',
        name: 'Urgent',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tasks: [
          {
            id: '750e8400-e29b-41d4-a716-446655440001',
            title: 'Complete project documentation',
            description: 'Write comprehensive API documentation',
            isCompleted: false,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tag or task not found or does not belong to user',
  })
  @ApiResponse({
    status: 409,
    description: 'Tag is already attached to this task',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async attachToTask(
    @Req() req,
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.attachToTask(req.user.id, tagId, taskId);
  }

  @Delete('/:tagId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Detach a tag from a task',
    description:
      'Removes the association between a tag and a task. Both the tag and task must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'tagId',
    description: 'Tag ID (UUID)',
    example: '850e8400-e29b-41d4-a716-446655440003',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID (UUID)',
    example: '750e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 204,
    description: 'Tag successfully detached from task',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag, task, or association not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async detachFromTask(
    @Req() req,
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.detachFromTask(req.user.id, tagId, taskId);
  }
}
