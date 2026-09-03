import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import type { LoginInput, RefreshInput } from '../validators/auth.validators';

function authError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export const AuthService = {
  async login(input: LoginInput) {
    const user = await UserRepository.findByPhone(input.phone);

    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
      throw authError('Invalid phone number or password.', 401);
    }

    if (!user.is_active) {
      throw authError('This account has been deactivated.', 403);
    }

    const payload = { userId: user.id, role: user.role };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    };
  },

  async refresh(input: RefreshInput) {
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch {
      throw authError('Invalid or expired refresh token.', 401);
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user || !user.is_active) {
      throw authError('Account not found or deactivated.', 401);
    }

    return {
      accessToken: signAccessToken({ userId: user.id, role: user.role }),
    };
  },
};
