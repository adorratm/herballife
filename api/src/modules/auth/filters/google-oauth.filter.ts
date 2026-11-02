import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  customerOauthErrorUrl,
  parseCustomerOauthClient,
} from '@modules/auth/oauth-redirect';

@Catch()
export class GoogleOauthFilter implements ExceptionFilter {
  private readonly logger = new Logger(GoogleOauthFilter.name);

  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    if (res.headersSent) {
      return;
    }

    const message = resolveCustomerOauthMessage(
      exception,
      'Google girişi reddedildi',
    );
    this.logger.warn(`Google OAuth: ${message}`);

    const client = parseCustomerOauthClient(req.query?.state);
    res.redirect(customerOauthErrorUrl(this.config, client, message));
  }
}

function resolveCustomerOauthMessage(
  exception: unknown,
  fallback: string,
): string {
  if (exception instanceof HttpException) {
    const responseBody = exception.getResponse();
    if (typeof responseBody === 'string') return responseBody || fallback;
    if (
      typeof responseBody === 'object' &&
      responseBody &&
      'message' in responseBody
    ) {
      const msg = Array.isArray(responseBody.message)
        ? (responseBody as { message: string[] }).message[0]
        : (responseBody as { message: string }).message;
      return String(msg || fallback);
    }
    return exception.message || fallback;
  }
  if (exception instanceof Error) {
    const code =
      'code' in exception ? String((exception as { code: unknown }).code) : '';
    const blob = `${code} ${exception.message}`.toLowerCase();
    if (/invalid_grant|already used|bad request/i.test(blob)) {
      return 'Oturum kodu geçersiz veya kullanılmış; Google ile tekrar giriş yapın';
    }
    return exception.message || fallback;
  }
  return fallback;
}
