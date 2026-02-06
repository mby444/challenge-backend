import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTagDto: CreateTagDto) {
    return this.prisma.tag.create({
      data: {
        ...createTagDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({ where: { userId } });
  }

  async findOne(userId: string, id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
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
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to update tag with ID ${id}`,
      );
    }

    return this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });
  }

  async remove(userId: string, id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to delete tag with ID ${id}`,
      );
    }

    await this.prisma.tag.delete({
      where: { id },
    });
    return { message: 'Tag deleted successfully' };
  }

  async attachToTask(userId: string, tagId: string, taskId: string) {
    return this.prisma.task.update({
      where: { id: taskId, userId },
      data: { tags: { connect: [{ id: tagId }] } },
    });
  }

  async detachFromTask(userId: string, tagId: string, taskId: string) {
    return this.prisma.task.update({
      where: { id: taskId, userId },
      data: { tags: { disconnect: [{ id: tagId }] } },
    });
  }
}
