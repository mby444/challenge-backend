import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTagDto: CreateTagDto) {
    try {
      const tag = await this.prisma.tag.create({
        data: {
          ...createTagDto,
          userId,
        },
      });
      return tag;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Tag with this name already exists for this user',
        );
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({ where: { userId } });
  }

  async findOne(userId: string, id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!tag) {
      throw new NotFoundException(`Tag not found`);
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to access tag with ID ${id}`,
      );
    }

    return tag;
  }

  async update(userId: string, id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!tag) {
      throw new NotFoundException(`Tag not found`);
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to update tag with ID ${id}`,
      );
    }

    try {
      const tag = await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });
      return tag;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Tag with this name already exists for this user',
        );
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag not found`);
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to delete tag with ID ${id}`,
      );
    }

    await this.prisma.tag.delete({
      where: { id },
    });
  }

  async attachToTask(userId: string, tagId: string, taskId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to connect tag with ID ${tagId}`,
      );
    }

    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to connect task with ID ${taskId}`,
      );
    }

    return this.prisma.tag.update({
      where: { id: tagId, userId },
      data: { tasks: { connect: [{ id: taskId }] } },
      include: { tasks: true },
    });
  }

  async detachFromTask(userId: string, tagId: string, taskId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to disconnect tag with ID ${tagId}`,
      );
    }

    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to disconnect task with ID ${taskId}`,
      );
    }

    await this.prisma.tag.update({
      where: { id: tagId, userId },
      data: { tasks: { disconnect: [{ id: taskId }] } },
    });
  }
}
