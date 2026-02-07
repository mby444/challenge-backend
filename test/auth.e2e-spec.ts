import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDb, registerUser, loginUser, getAccessToken } from './e2e-utils';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';

describe('AuthModule (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    prismaService = app.get(PrismaService);
    await cleanDb(prismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  const registerUserDto: RegisterUserDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    birth: new Date('2000-01-01'),
  };

  describe('POST /api/auth/register', () => {
    it('[Sukses] Mendaftar dengan email dan password yang valid.', async () => {
      const response = await registerUser(app, registerUserDto);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.email).toBe(registerUserDto.email);
      expect(response.body.name).toBe(registerUserDto.name);
      expect(response.body.password).toBeUndefined(); // Password should not be returned
    });

    it('[Gagal] Mendaftar dengan email yang sudah ada.', async () => {
      await registerUser(app, registerUserDto); // First registration

      const response = await registerUser(app, registerUserDto); // Second registration with same

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already exists');
    });

    it('[Gagal] Mendaftar dengan data yang tidak valid (email salah format, password pendek).', async () => {
      const invalidUserDto = {
        email: 'invalid-email', // Invalid email
        password: 'short', // Short password
        name: 'Invalid User',
        birth: new Date('2000-01-01'),
      };
      const response = await registerUser(
        app,
        invalidUserDto as RegisterUserDto,
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ]),
      );
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await registerUser(app, registerUserDto); // Ensure a user exists for login tests
    });

    it('[Sukses] Login dengan email dan password yang benar.', async () => {
      const response = await loginUser(app, {
        email: registerUserDto.email,
        password: registerUserDto.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.access_token).toBeDefined();
    });

    it('[Gagal] Login dengan email yang salah.', async () => {
      const response = await loginUser(app, {
        email: 'wrong@example.com',
        password: registerUserDto.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('[Gagal] Login dengan password yang salah.', async () => {
      const response = await loginUser(app, {
        email: registerUserDto.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
