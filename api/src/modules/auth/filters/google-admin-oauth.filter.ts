import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { oauthErrorUrl, parseOauthClient } from '@modules/auth/oauth-redirect';

/**
 * Admin Google OAuth hatalarında JSON yerine login sayfasına yönlendirir.
 * headersSent ise ikinci yanıt yazılmaz.
 */
@Catch()
export class GoogleAdminOauthFilter implements ExceptionFilter {
  private readonly logger = new Logger(GoogleAdminOauthFilter.name);

  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    if (res.headersSent) {
      return;
    }

    const message = resolveOauthMessage(exception, 'Admin girişi reddedildi');
    this.logger.warn(
      `Google admin OAuth: ${message}` +
        (exception instanceof Error && exception.stack
          ? ` | ${exception.name}`
          : ''),
    );

    const client = parseOauthClient(req.query?.state);
    res.redirect(oauthErrorUrl(this.config, client, message));
  }
}

function resolveOauthMessage(exception: unknown, fallback: string): string {
  if (exception instanceof HttpException) {
    const responseBody = exception.getResponse();
    const fromBody =
      typeof responseBody === 'string'
        ? responseBody
        : typeof responseBody === 'object' &&
            responseBody &&
            'message' in responseBody
          ? String(
              Array.isArray(responseBody.message)
                ? (responseBody as { message: string[] }).message[0]
                : (responseBody as { message: string }).message,
            )
          : exception.message;
    if (/allowlist/i.test(fromBody)) {
      return 'Bu e-posta admin allowlist’te değil';
    }
    return fromBody || fallback;
  }

  if (exception instanceof Error) {
    const code =
      'code' in exception ? String((exception as { code: unknown }).code) : '';
    const blob = `${code} ${exception.message}`.toLowerCase();
    if (/invalid_grant|already used|bad request/i.test(blob)) {
      return 'Oturum kodu geçersiz veya kullanılmış; Google ile tekrar giriş yapın';
    }
    if (/redirect_uri/i.test(blob)) {
      return 'Google OAuth yönlendirme adresi uyuşmuyor (callback URL)';
    }
    if (/invalid_client/i.test(blob)) {
      return 'Google OAuth istemci yapılandırması hatalı (Client ID/Secret)';
    }
    return exception.message || fallback;
  }

  return fallback;
}
