import { ConfigService } from '@nestjs/config';

export type OpsOauthClient = 'admin';
export type CustomerOauthClient = 'frontend';

export function parseOauthClient(_state?: unknown): OpsOauthClient {
  return 'admin';
}

export function parseCustomerOauthClient(
  _state?: unknown,
): CustomerOauthClient {
  return 'frontend';
}

function trimSlash(url: string): string {
  return url.replace(/\/$/, '');
}

export function oauthSuccessUrl(
  config: ConfigService,
  _client: OpsOauthClient,
  token: string,
): string {
  const tokenQ = `token=${encodeURIComponent(token)}`;
  return `${trimSlash(config.get<string>('adminUrl') || 'http://localhost:3001')}/auth/callback?${tokenQ}`;
}

export function oauthErrorUrl(
  config: ConfigService,
  _client: OpsOauthClient,
  message: string,
): string {
  const err = `error=${encodeURIComponent(message)}`;
  return `${trimSlash(config.get<string>('adminUrl') || 'http://localhost:3001')}/login?${err}`;
}

export function customerOauthErrorUrl(
  config: ConfigService,
  _client: CustomerOauthClient,
  message: string,
): string {
  const err = `error=${encodeURIComponent(message)}`;
  return `${trimSlash(config.get<string>('frontendUrl') || 'http://localhost:3000')}/giris?${err}`;
}
