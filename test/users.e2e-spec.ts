import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDb, registerUser, loginUser, getAccessToken } from './e2e-utils';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';

describe('UsersModule (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let accessToken: string;
  let userEmail: string;

  const registerUserDto: RegisterUserDto = {
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User',
    birth: new Date('2000-01-01'),
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

    // Register and login a user for authenticated tests
    await registerUser(app, registerUserDto);
    userEmail = registerUserDto.email;
    const loginResponse = await loginUser(app, {
      email: registerUserDto.email,
      password: registerUserDto.password,
    });
    accessToken = getAccessToken(loginResponse);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/me', () => {
    it('[Sukses] Mengambil profil dengan token yang valid.', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeDefined();
      expect(response.body.email).toBe(registerUserDto.email);
      expect(response.body.name).toBe(registerUserDto.name);
      expect(response.body.password).toBeUndefined();
    });

    it('[Gagal] Mengakses tanpa token atau dengan token yang tidak valid.', async () => {
      const response = await request(app.getHttpServer()).get('/api/users/me'); // No token

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/users/me', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      birth: new Date('1990-05-10'),
    };

    it('[Sukses] Memperbarui nama dan tanggal lahir dengan data yang valid.', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(updateUserDto.name);
      expect(new Date(response.body.birth).toISOString()).toBe(
        updateUserDto.birth.toISOString(),
      );
    });

    it('[Gagal] Mengakses tanpa token atau dengan token yang tidak valid.', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/me')
        .send(updateUserDto); // No token

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Memperbarui dengan data yang tidak valid (misalnya, nama bukan string).', async () => {
      const invalidUpdateUserDto = {
        name: 123, // Invalid name type
      };

      const response = await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidUpdateUserDto);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['name must be a string']),
      );
    });
  });

  describe('DELETE /api/users/me', () => {
    it('[Sukses] Menghapus akun sendiri dengan token yang valid.', async () => {
      const deleteResponse = await request(app.getHttpServer())
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(HttpStatus.NO_CONTENT);

      // Verify user is deleted by trying to log in
      const loginAttemptAfterDelete = await loginUser(app, {
        email: userEmail,
        password: registerUserDto.password,
      });
      expect(loginAttemptAfterDelete.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[Gagal] Mengakses tanpa token atau dengan token yang tidak valid.', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/api/users/me',
      ); // No token

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
