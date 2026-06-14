import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

interface StoredCaptchaChallenge {
  id: string;
  question: string;
  answer: string;
}

interface LoginAttemptState {
  failedAttempts: number;
  captcha?: StoredCaptchaChallenge;
}

interface LoginCaptchaPayload {
  captchaId?: string;
  captchaAnswer?: string;
}

@Injectable()
export class AuthService {
  private readonly maxFailedAttemptsWithoutCaptcha = 5;
  private readonly loginAttempts = new Map<string, LoginAttemptState>();

  constructor(private readonly usersService: UsersService) {}

  async login(identifier: string, password: string, captcha?: LoginCaptchaPayload) {
    const attemptKey = this.normalizeIdentifier(identifier);
    const attemptState = this.getAttemptState(attemptKey);

    if (attemptState.failedAttempts > this.maxFailedAttemptsWithoutCaptcha) {
      this.assertCaptchaIsValid(attemptKey, captcha);
    }

    const user = await this.usersService.findByIdentifier(identifier);
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      this.registerFailedAttempt(attemptKey);
      this.throwInvalidCredentials(attemptKey);
    }

    this.clearFailedAttempts(attemptKey);

    return {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  private normalizeIdentifier(identifier: string): string {
    return identifier.trim().toLowerCase();
  }

  private getAttemptState(attemptKey: string): LoginAttemptState {
    const existing = this.loginAttempts.get(attemptKey);
    if (existing) return existing;

    const initialState: LoginAttemptState = { failedAttempts: 0 };
    this.loginAttempts.set(attemptKey, initialState);
    return initialState;
  }

  private registerFailedAttempt(attemptKey: string): LoginAttemptState {
    const state = this.getAttemptState(attemptKey);
    state.failedAttempts += 1;

    if (state.failedAttempts > this.maxFailedAttemptsWithoutCaptcha) {
      this.ensureCaptchaChallenge(state);
    }

    return state;
  }

  private assertCaptchaIsValid(attemptKey: string, captcha?: LoginCaptchaPayload): void {
    const state = this.getAttemptState(attemptKey);
    const challenge = this.ensureCaptchaChallenge(state);

    if (
      !captcha?.captchaId ||
      !captcha?.captchaAnswer ||
      captcha.captchaId !== challenge.id ||
      captcha.captchaAnswer.trim() !== challenge.answer
    ) {
      // Rotate captcha after a wrong or missing answer to reduce repeated guessing.
      state.captcha = this.createCaptchaChallenge();
      this.throwCaptchaRequired('Vui lòng xác minh captcha để tiếp tục đăng nhập', state.captcha);
    }
  }

  private throwInvalidCredentials(attemptKey: string): never {
    const state = this.getAttemptState(attemptKey);

    if (state.failedAttempts > this.maxFailedAttemptsWithoutCaptcha) {
      const challenge = this.ensureCaptchaChallenge(state);
      this.throwCaptchaRequired(
        'Tài khoản hoặc mật khẩu không đúng. Vui lòng xác minh captcha để tiếp tục.',
        challenge,
      );
    }

    throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
  }

  private throwCaptchaRequired(message: string, challenge: StoredCaptchaChallenge): never {
    throw new UnauthorizedException({
      message,
      captchaRequired: true,
      captchaChallenge: {
        id: challenge.id,
        question: challenge.question,
      },
    });
  }

  private ensureCaptchaChallenge(state: LoginAttemptState): StoredCaptchaChallenge {
    if (!state.captcha) {
      state.captcha = this.createCaptchaChallenge();
    }

    return state.captcha;
  }

  private createCaptchaChallenge(): StoredCaptchaChallenge {
    const left = Math.floor(Math.random() * 9) + 1;
    const right = Math.floor(Math.random() * 9) + 1;

    return {
      id: randomUUID(),
      question: `${left} + ${right} = ?`,
      answer: String(left + right),
    };
  }

  private clearFailedAttempts(attemptKey: string): void {
    this.loginAttempts.delete(attemptKey);
  }
}
