import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Passport TokenError (invalid_grant vb.) düz Error olduğu için Nest 500 döner.
 * Bunları HttpException’a çevirir; GoogleAdminOauthFilter login’e yönlendirir.
 */
@Injectable()
export class GoogleAdminAuthGuard extends AuthGuard('google-admin') {
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

export function mapGoogleOauthFailure(
  err: unknown,
  info?: unknown,
): HttpException {
  const raw =
    (err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : '') ||
    (info && typeof info === 'object' && 'message' in info
      ? String((info as { message: unknown }).message)
      : '') ||
    (typeof info === 'string' ? info : '') ||
    'Google girişi başarısız';

  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';

  const blob = `${code} ${raw}`.toLowerCase();

  if (/allowlist/i.test(raw)) {
    return new ForbiddenException('Bu e-posta admin allowlist’te değil');
  }
  if (/invalid_grant|already used|bad request/i.test(blob)) {
    return new UnauthorizedException(
      'Oturum kodu geçersiz veya kullanılmış; Google ile tekrar giriş yapın',
    );
  }
  if (/redirect_uri|redirect uri/i.test(blob)) {
    return new UnauthorizedException(
      'Google OAuth yönlendirme adresi uyuşmuyor (callback URL)',
    );
  }
  if (/invalid_client|unauthorized_client/i.test(blob)) {
    return new UnauthorizedException(
      'Google OAuth istemci yapılandırması hatalı (Client ID/Secret)',
    );
  }
  if (/e-posta yok|email/i.test(raw) && /yok|missing|not/i.test(raw)) {
    return new UnauthorizedException('Google hesabında e-posta yok');
  }

  return new UnauthorizedException(raw);
}
