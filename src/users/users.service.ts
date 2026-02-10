import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const { password, ...user } = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });

    return user;
  }

  async remove(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
