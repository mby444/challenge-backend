import { PrismaService } from '../src/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';
import { LoginUserDto } from '../src/auth/dto/login-user.dto';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';

export async function cleanDb(prisma: PrismaService) {
  // Delete data in a specific order to avoid foreign key constraints issues
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
}

export async function registerUser(app: INestApplication, userData: RegisterUserDto) {
  return request(app.getHttpServer())
    .post('/api/auth/register')
    .send(userData);
}

export async function loginUser(app: INestApplication, credentials: LoginUserDto) {
  return request(app.getHttpServer())
    .post('/api/auth/login')
    .send(credentials);
}

export function getAccessToken(response: request.Response): string {
  return response.body.access_token;
}

export async function createTask(app: INestApplication, taskData: CreateTaskDto, userToken: string) {
  return request(app.getHttpServer())
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userToken}`)
    .send(taskData);
}
