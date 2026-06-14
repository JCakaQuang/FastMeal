import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => 'captcha-id-1'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    usersService = {
      findByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    authService = new AuthService(usersService);
    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.compare as jest.Mock).mockResolvedValue(false as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws UnauthorizedException when user not found', async () => {
    usersService.findByIdentifier.mockResolvedValue(null as any);

    await expect(authService.login('test@example.com', '123456')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    usersService.findByIdentifier.mockResolvedValue({
      _id: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false as any);

    await expect(authService.login('u1@test.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('requires captcha after more than 5 failed login attempts', async () => {
    usersService.findByIdentifier.mockResolvedValue({
      _id: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false as any);

    for (let index = 0; index < 5; index += 1) {
      await expect(authService.login('u1@test.com', 'wrong')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }

    await expect(authService.login('u1@test.com', 'wrong')).rejects.toMatchObject({
      response: expect.objectContaining({
        captchaRequired: true,
        captchaChallenge: expect.objectContaining({
          id: 'captcha-id-1',
          question: expect.stringContaining('+'),
        }),
      }),
    });
  });

  it('rejects login without captcha after captcha mode is enabled', async () => {
    usersService.findByIdentifier.mockResolvedValue({
      _id: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false as any);

    for (let index = 0; index < 6; index += 1) {
      await expect(authService.login('u1@test.com', 'wrong')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }

    await expect(authService.login('u1@test.com', '123456')).rejects.toMatchObject({
      response: expect.objectContaining({
        captchaRequired: true,
      }),
    });
  });

  it('returns user info when credentials are valid', async () => {
    usersService.findByIdentifier.mockResolvedValue({
      _id: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true as any);

    const result = await authService.login('u1@test.com', '123456');

    expect(result).toEqual({
      userId: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
    });
  });

  it('allows successful login with valid captcha after brute force protection is triggered', async () => {
    usersService.findByIdentifier.mockResolvedValue({
      _id: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false as any);

    for (let index = 0; index < 6; index += 1) {
      await expect(authService.login('u1@test.com', 'wrong')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }

    (bcrypt.compare as jest.Mock).mockResolvedValue(true as any);

    const result = await authService.login('u1@test.com', '123456', {
      captchaId: 'captcha-id-1',
      captchaAnswer: '10',
    });

    expect(result).toEqual({
      userId: 'user1',
      fullName: 'User One',
      email: 'u1@test.com',
      role: 'customer',
    });
  });
});
