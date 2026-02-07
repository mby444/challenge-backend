import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDb, registerUser, loginUser, getAccessToken } from './e2e-utils';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto';

describe('TasksModule (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;

  const userARegisterDto: RegisterUserDto = {
    email: 'userA@example.com',
    password: 'passwordA',
    name: 'User A',
    birth: new Date('1990-01-01'),
  };

  const userBRegisterDto: RegisterUserDto = {
    email: 'userB@example.com',
    password: 'passwordB',
    name: 'User B',
    birth: new Date('1995-05-05'),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    prismaService = app.get(PrismaService);
    await cleanDb(prismaService);

    // Register and login User A
    await registerUser(app, userARegisterDto);
    const loginAResponse = await loginUser(app, {
      email: userARegisterDto.email,
      password: userARegisterDto.password,
    });
    userAToken = getAccessToken(loginAResponse);
    const userA = await prismaService.user.findUnique({
      where: { email: userARegisterDto.email },
    });
    userAId = userA.id;

    // Register and login User B
    await registerUser(app, userBRegisterDto);
    const loginBResponse = await loginUser(app, {
      email: userBRegisterDto.email,
      password: userBRegisterDto.password,
    });
    userBToken = getAccessToken(loginBResponse);
    const userB = await prismaService.user.findUnique({
      where: { email: userBRegisterDto.email },
    });
    userBId = userB.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/tasks', () => {
    it('[Sukses] Pengguna A membuat tugas baru dengan data yang valid.', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Buy groceries',
        description: 'Milk, Eggs, Bread',
      };
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(createTaskDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toBeDefined();
      expect(response.body.title).toBe(createTaskDto.title);
      expect(response.body.description).toBe(createTaskDto.description);
      expect(response.body.userId).toBe(userAId);
    });

    it('[Gagal] Membuat tugas dengan data yang tidak valid (misalnya, judul kosong).', async () => {
      const invalidCreateTaskDto = {
        title: '', // Empty title
        description: 'Some description',
      };
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(invalidCreateTaskDto);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['title should not be empty']),
      );
    });

    it('[Gagal] Membuat tugas tanpa token autentikasi.', async () => {
      const createTaskDto: CreateTaskDto = { title: 'Do something' };
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .send(createTaskDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create tasks for User A
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task A1' });
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task A2' });
      // Create a task for User B
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Task B1' });
    });

    it('[Sukses] Pengguna A mengambil daftar tugasnya.', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);

      console.log('log tasks body', response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body.map((task) => task.title)).toEqual(
        expect.arrayContaining(['Task A1', 'Task A2']),
      );
      expect(response.body.map((task) => task.userId)).toEqual(
        expect.arrayContaining([userAId, userAId]),
      );
    });

    it('[Sukses] Pengguna yang belum punya tugas mengambil daftar tugasnya.', async () => {
      // Clean db and register a new user with no tasks
      await cleanDb(prismaService);
      const newUserRegisterDto: RegisterUserDto = {
        email: 'no_task_user@example.com',
        password: 'password',
        name: 'No Task User',
        birth: new Date('2000-01-01'),
      };
      await registerUser(app, newUserRegisterDto);
      const loginResponse = await loginUser(app, newUserRegisterDto);
      const noTaskUserToken = getAccessToken(loginResponse);

      const response = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${noTaskUserToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('[Gagal] Mengambil daftar tugas tanpa token autentikasi.', async () => {
      const response = await request(app.getHttpServer()).get('/api/tasks');

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let userATaskId: string;
    let userBTaskId: string;

    beforeEach(async () => {
      const createTaskAResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'User A Task' });
      userATaskId = createTaskAResponse.body.id;

      const createTaskBResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'User B Task' });
      userBTaskId = createTaskBResponse.body.id;
    });

    it('[Sukses] Pengguna A mengambil detail tugas miliknya.', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(userATaskId);
      expect(response.body.title).toBe('User A Task');
    });

    it('[Gagal] Pengguna A mengambil detail tugas yang tidak ada (ID salah).', async () => {
      const nonExistentTaskId = 'clsd0l0gq00003l7998o6w2h1'; // A random, unlikely ID
      const response = await request(app.getHttpServer())
        .get(`/api/tasks/${nonExistentTaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Task not found');
    });

    it('[Gagal] Pengguna B mencoba mengambil detail tugas milik Pengguna A.', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Mengambil detail tugas tanpa token autentikasi.', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/tasks/${userATaskId}`,
      );

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    let userATaskId: string;
    let userBTaskId: string;

    beforeEach(async () => {
      const createTaskAResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'User A Task' });
      userATaskId = createTaskAResponse.body.id;

      const createTaskBResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'User B Task' });
      userBTaskId = createTaskBResponse.body.id;
    });

    it('[Sukses] Pengguna A memperbarui tugas miliknya.', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated User A Task',
        isCompleted: true,
      };
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateTaskDto);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(userATaskId);
      expect(response.body.title).toBe(updateTaskDto.title);
      expect(response.body.isCompleted).toBe(updateTaskDto.isCompleted);
    });

    it('[Gagal] Pengguna B mencoba memperbarui tugas milik Pengguna A.', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Attempted Update' };
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send(updateTaskDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Pengguna A memperbarui tugas yang tidak ada (ID salah).', async () => {
      const nonExistentTaskId = 'clsd0l0gq00003l7998o6w2h1';
      const updateTaskDto: UpdateTaskDto = { title: 'Attempted Update' };
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/${nonExistentTaskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateTaskDto);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Task not found');
    });

    it('[Gagal] Memperbarui tugas tanpa token autentikasi.', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Attempted Update' };
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/${userATaskId}`)
        .send(updateTaskDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let userATaskId: string;
    let userBTaskId: string;

    beforeEach(async () => {
      const createTaskAResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'User A Task to Delete' });
      userATaskId = createTaskAResponse.body.id;

      const createTaskBResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'User B Task to Delete' });
      userBTaskId = createTaskBResponse.body.id;
    });

    it('[Sukses] Pengguna A menghapus tugas miliknya.', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      // Verify the task is deleted
      const getResponse = await request(app.getHttpServer())
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[Gagal] Pengguna B mencoba menghapus tugas milik Pengguna A.', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Pengguna A menghapus tugas yang tidak ada (ID salah).', async () => {
      const nonExistentTaskId = 'clsd0l0gq00003l7998o6w2h1';
      const response = await request(app.getHttpServer())
        .delete(`/api/tasks/${nonExistentTaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Task not found');
    });

    it('[Gagal] Menghapus tugas tanpa token autentikasi.', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/tasks/${userATaskId}`,
      );

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
