import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersController } from '../src/modules/users/users.controller';
import { UsersService } from '../src/modules/users/users.service';
import { DishesController } from '../src/modules/dishes/dishes.controller';
import { DishesService } from '../src/modules/dishes/dishes.service';

describe('FastMeal API integration (e2e)', () => {
  let app: INestApplication<App>;

  const authServiceMock = {
    login: jest.fn(),
  };

  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateRole: jest.fn(),
    deleteUser: jest.fn(),
  };

  const dishesServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, AuthController, UsersController, DishesController],
      providers: [
        AppService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: DishesService, useValue: dishesServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) returns health greeting', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('/auth/login (POST) validates required payload fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: 'customer@test.com' })
      .expect(400);

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('/auth/login (POST) returns login result', async () => {
    const loginResult = {
      userId: 'u1',
      fullName: 'Customer One',
      email: 'customer@test.com',
      role: 'customer',
    };
    authServiceMock.login.mockResolvedValue(loginResult);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: 'customer@test.com', password: '123456' })
      .expect(201)
      .expect(loginResult);

    expect(authServiceMock.login).toHaveBeenCalledWith('customer@test.com', '123456');
  });

  it('/users/register (POST) creates user and returns userId', async () => {
    usersServiceMock.create.mockResolvedValue({ _id: 'u1' });

    await request(app.getHttpServer())
      .post('/users/register')
      .send({ fullName: 'Customer One', email: 'customer@test.com', password: '123456' })
      .expect(201)
      .expect({ message: 'Đăng ký thành công', userId: 'u1' });
  });

  it('/users/register (POST) validates invalid email and short password', async () => {
    await request(app.getHttpServer())
      .post('/users/register')
      .send({ fullName: 'Customer One', email: 'invalid-email', password: '123' })
      .expect(400);

    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });

  it('/dishes (GET) returns available dishes by default', async () => {
    const dishes = [{ _id: 'd1', name: 'Phở bò', price: 45000, isAvailable: true }];
    dishesServiceMock.findAll.mockResolvedValue(dishes);

    await request(app.getHttpServer()).get('/dishes').expect(200).expect(dishes);

    expect(dishesServiceMock.findAll).toHaveBeenCalledWith(true);
  });

  it('/dishes?all=true (GET) returns all dishes', async () => {
    const dishes = [{ _id: 'd1' }, { _id: 'd2', isAvailable: false }];
    dishesServiceMock.findAll.mockResolvedValue(dishes);

    await request(app.getHttpServer()).get('/dishes?all=true').expect(200).expect(dishes);

    expect(dishesServiceMock.findAll).toHaveBeenCalledWith(false);
  });
});
