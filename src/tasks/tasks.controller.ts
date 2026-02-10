import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new task',
    description:
      'Creates a new task for the authenticated user. The task can include a title, description, and completion status.',
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    schema: {
      example: {
        id: '750e8400-e29b-41d4-a716-446655440001',
        title: 'Complete project documentation',
        description:
          'Write comprehensive API documentation using OpenAPI/Swagger specifications',
        isCompleted: false,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2024-01-10T12:00:00.000Z',
        updatedAt: '2024-01-10T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['title should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all tasks',
    description: 'Retrieves all tasks belonging to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    schema: {
      example: [
        {
          id: '750e8400-e29b-41d4-a716-446655440001',
          title: 'Complete project documentation',
          description: 'Write comprehensive API documentation',
          isCompleted: false,
          userId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-01-10T12:00:00.000Z',
          updatedAt: '2024-01-10T12:00:00.000Z',
          tags: [],
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440002',
          title: 'Review code',
          description: 'Review pull requests',
          isCompleted: true,
          userId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-01-09T10:00:00.000Z',
          updatedAt: '2024-01-10T15:00:00.000Z',
          tags: [],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findAll(@Req() req) {
    return this.tasksService.findAll(req.user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific task',
    description:
      'Retrieves a specific task by ID. The task must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID (UUID)',
    example: '750e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    schema: {
      example: {
        id: '750e8400-e29b-41d4-a716-446655440001',
        title: 'Complete project documentation',
        description: 'Write comprehensive API documentation',
        isCompleted: false,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2024-01-10T12:00:00.000Z',
        updatedAt: '2024-01-10T12:00:00.000Z',
        tags: [],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found or does not belong to user',
    schema: {
      example: {
        statusCode: 404,
        message: 'Task not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findOne(@Param('id') id: string, @Req() req) {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Updates a specific task by ID. The task must belong to the authenticated user. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID (UUID)',
    example: '750e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    schema: {
      example: {
        id: '750e8400-e29b-41d4-a716-446655440001',
        title: 'Updated task title',
        description: 'Updated task description',
        isCompleted: true,
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
    description: 'Task not found or does not belong to user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ) {
    return this.tasksService.update(req.user.id, id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a task',
    description:
      'Permanently deletes a specific task by ID. The task must belong to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID (UUID)',
    example: '750e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 204,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found or does not belong to user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.remove(req.user.id, id);
  }
}
