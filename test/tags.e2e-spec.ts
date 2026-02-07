import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDb, registerUser, loginUser, getAccessToken } from './e2e-utils';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';
import { CreateTagDto } from '../src/tags/dto/create-tag.dto';
import { UpdateTagDto } from '../src/tags/dto/update-tag.dto';

describe('TagsModule (e2e)', () => {
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

  describe('POST /api/tags', () => {
    it('[Sukses] Pengguna A membuat tag baru dengan data yang valid.', async () => {
      const createTagDto: CreateTagDto = { name: 'Work' };
      const response = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(createTagDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(createTagDto.name);
      expect(response.body.userId).toBe(userAId);
    });

    it('[Gagal] Membuat tag dengan nama yang duplikat untuk pengguna yang sama.', async () => {
      const createTagDto: CreateTagDto = { name: 'Personal' };
      await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(createTagDto);

      const response = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(createTagDto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.message).toBe(
        'Tag with this name already exists for this user',
      );
    });

    it('[Gagal] Membuat tag tanpa token autentikasi.', async () => {
      const createTagDto: CreateTagDto = { name: 'Shopping' };
      const response = await request(app.getHttpServer())
        .post('/api/tags')
        .send(createTagDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/tags', () => {
    beforeEach(async () => {
      // Create tags for User A
      await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Work' });
      await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Personal' });
      // Create a tag for User B
      await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Hobbies' });
    });

    it('[Sukses] Pengguna A mengambil daftar tag-nya.', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body.map((tag) => tag.name)).toEqual(
        expect.arrayContaining(['Work', 'Personal']),
      );
      expect(response.body.map((tag) => tag.userId)).toEqual(
        expect.arrayContaining([userAId, userAId]),
      );
    });

    it('[Gagal] Mengambil daftar tag tanpa token autentikasi.', async () => {
      const response = await request(app.getHttpServer()).get('/api/tags');

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/tags/:id', () => {
    let userATagId: string;

    beforeEach(async () => {
      const createTagResponse = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Important' });
      userATagId = createTagResponse.body.id;
    });

    it('[Sukses] Pengguna A mengambil detail tag miliknya.', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(userATagId);
      expect(response.body.name).toBe('Important');
      expect(response.body.userId).toBe(userAId);
    });

    it('[Gagal] Pengguna B mencoba mengambil detail tag milik Pengguna A.', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Mengambil detail tag yang tidak ada.', async () => {
      const nonExistentTagId = 'clsd0l0gq00003l7998o6w2h1'; // A random, unlikely ID
      const response = await request(app.getHttpServer())
        .get(`/api/tags/${nonExistentTagId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Tag not found');
    });
  });

  describe('PATCH /api/tags/:id', () => {
    let userATagId: string;

    beforeEach(async () => {
      const createTagResponse = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Old Tag Name' });
      userATagId = createTagResponse.body.id;
    });

    it('[Sukses] Pengguna A memperbarui tag miliknya.', async () => {
      const updateTagDto: UpdateTagDto = { name: 'New Tag Name' };
      const response = await request(app.getHttpServer())
        .patch(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateTagDto);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(userATagId);
      expect(response.body.name).toBe(updateTagDto.name);
    });

    it('[Gagal] Pengguna B mencoba memperbarui tag milik Pengguna A.', async () => {
      const updateTagDto: UpdateTagDto = { name: 'Attempted Update' };
      const response = await request(app.getHttpServer())
        .patch(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send(updateTagDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Memperbarui tag yang tidak ada.', async () => {
      const nonExistentTagId = 'clsd0l0gq00003l7998o6w2h1';
      const updateTagDto: UpdateTagDto = { name: 'Attempted Update' };
      const response = await request(app.getHttpServer())
        .patch(`/api/tags/${nonExistentTagId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateTagDto);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Tag not found');
    });

    it('[Gagal] Memperbarui dengan nama tag duplikat untuk pengguna yang sama.', async () => {
      // Create another tag for User A
      await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Existing Tag' });

      const updateTagDto: UpdateTagDto = { name: 'Existing Tag' }; // Attempt to update with a duplicate name
      const response = await request(app.getHttpServer())
        .patch(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateTagDto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.message).toBe(
        'Tag with this name already exists for this user',
      );
    });
  });

  describe('DELETE /api/tags/:id', () => {
    let userATagId: string;

    beforeEach(async () => {
      const createTagResponse = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Tag to Delete' });
      userATagId = createTagResponse.body.id;
    });

    it('[Sukses] Pengguna A menghapus tag miliknya.', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      // Verify the tag is deleted
      const getResponse = await request(app.getHttpServer())
        .get(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[Gagal] Pengguna B mencoba menghapus tag milik Pengguna A.', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tags/${userATagId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Menghapus tag yang tidak ada.', async () => {
      const nonExistentTagId = 'clsd0l0gq00003l7998o6w2h1';
      const response = await request(app.getHttpServer())
        .delete(`/api/tags/${nonExistentTagId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Tag not found');
    });
  });

  describe('Suite Pengujian: Asosiasi Tugas-Tag (/api/tags/.../tasks/...)', () => {
    let userATaskId: string;
    let userATagId: string;
    let userBTaskId: string;

    beforeEach(async () => {
      // Create a task for User A
      const createTaskResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task for Tagging' });
      userATaskId = createTaskResponse.body.id;

      // Create a tag for User A
      const createTagResponse = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'My Tag' });
      userATagId = createTagResponse.body.id;

      // Create a task for User B (to test unauthorized association)
      const createTaskBResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'User B Task for Tagging' });
      userBTaskId = createTaskBResponse.body.id;
    });

    describe('POST /api/tags/:tagId/tasks/:taskId', () => {
      it('[Sukses] Mengaitkan tag milik Pengguna A dengan tugas milik Pengguna A.', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/tags/${userATagId}/tasks/${userATaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);

        expect(response.status).toBe(HttpStatus.CREATED);

        // Verify association by fetching the task and checking its tags
        const taskResponse = await request(app.getHttpServer())
          .get(`/api/tasks/${userATaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);

        expect(taskResponse.status).toBe(HttpStatus.OK);
        expect(taskResponse.body.tags).toBeDefined();
        expect(
          taskResponse.body.tags.some((tag) => tag.id === userATagId),
        ).toBeTruthy();
      });

      it('[Gagal] Mengaitkan dengan ID tugas atau ID tag yang tidak valid.', async () => {
        const nonExistentId = 'clsd0l0gq00003l7998o6w2h1';

        // Invalid Tag ID
        let response = await request(app.getHttpServer())
          .post(`/api/tags/${nonExistentId}/tasks/${userATaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.body.message).toBe('Tag not found');

        // Invalid Task ID
        response = await request(app.getHttpServer())
          .post(`/api/tags/${userATagId}/tasks/${nonExistentId}`)
          .set('Authorization', `Bearer ${userAToken}`);
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.body.message).toBe('Task not found');
      });

      it('[Gagal] Mengaitkan tag milik Pengguna A dengan tugas milik Pengguna B.', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/tags/${userATagId}/tasks/${userBTaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('[Gagal] Mengaitkan tanpa token autentikasi.', async () => {
        const response = await request(app.getHttpServer()).post(
          `/api/tags/${userATagId}/tasks/${userATaskId}`,
        );

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('DELETE /api/tags/:tagId/tasks/:taskId', () => {
      beforeEach(async () => {
        // First, associate the tag with the task
        await request(app.getHttpServer())
          .post(`/api/tags/${userATagId}/tasks/${userATaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);
      });

      it('[Sukses] Melepaskan asosiasi tag dari tugas.', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/tags/${userATagId}/tasks/${userATaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);

        expect(response.status).toBe(HttpStatus.NO_CONTENT);

        // Verify disassociation
        const taskResponse = await request(app.getHttpServer())
          .get(`/api/tasks/${userATaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);

        expect(taskResponse.status).toBe(HttpStatus.OK);
        expect(taskResponse.body.tags).toBeDefined();
        expect(
          taskResponse.body.tags.some((tag) => tag.id === userATagId),
        ).toBeFalsy();
      });

      it('[Gagal] Melepaskan asosiasi dengan ID tugas atau ID tag yang tidak valid.', async () => {
        const nonExistentId = 'clsd0l0gq00003l7998o6w2h1';

        // Invalid Tag ID
        let response = await request(app.getHttpServer())
          .delete(`/api/tags/${nonExistentId}/tasks/${userATaskId}`)
          .set('Authorization', `Bearer ${userAToken}`);
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.body.message).toBe('Tag not found'); // Assuming tag not found is the primary error

        // Invalid Task ID
        response = await request(app.getHttpServer())
          .delete(`/api/tags/${userATagId}/tasks/${nonExistentId}`)
          .set('Authorization', `Bearer ${userAToken}`);
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.body.message).toBe('Task not found'); // Assuming task not found is the primary error
      });

      it('[Gagal] Melepaskan asosiasi tanpa token autentikasi.', async () => {
        const response = await request(app.getHttpServer()).delete(
          `/api/tags/${userATagId}/tasks/${userATaskId}`,
        );

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
