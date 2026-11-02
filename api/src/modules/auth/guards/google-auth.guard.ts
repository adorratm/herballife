import { Injectable, HttpException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { mapGoogleOauthFailure } from '@modules/auth/guards/google-admin-auth.guard';

/** Müşteri Google OAuth — TokenError’ları 500 yerine HttpException yapar. */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
  ): TUser {
    if (err instanceof HttpException) {
      throw err;
    }
    if (err || !user) {
      throw mapGoogleOauthFailure(err, info);
    }
    return user;
  }
}
