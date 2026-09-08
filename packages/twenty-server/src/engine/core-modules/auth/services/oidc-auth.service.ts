import { Injectable } from '@nestjs/common';

import { type Request, type Response } from 'express';
import { type Client, generators, Issuer } from 'openid-client';
import { parseJson } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type GoogleRequest } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { type SocialSsoSignInUpActionType } from 'src/engine/core-modules/auth/types/signInUp.type';
import { type SocialSsoState } from 'src/engine/core-modules/auth/types/social-sso-state.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Zone CRM: a generic OpenID Connect sign-in for the whole server (one identity
// provider, such as Authentik), written on the AGPL side. It deliberately does
// not touch the per-workspace SSO module, which is under the Enterprise licence.

export type OidcUser = GoogleRequest['user'];

type OidcTransaction = {
  state: string;
  nonce: string;
  codeVerifier: string;
  social: SocialSsoState;
};

const OIDC_COOKIE_NAME = 'zone_oidc';
const OIDC_COOKIE_PATH = '/auth/oidc';
const OIDC_TRANSACTION_TTL_MS = 10 * 60 * 1000;

const readCookie = (request: Request, name: string): string | undefined => {
  const header = request.headers.cookie;

  if (!header) {
    return undefined;
  }

  for (const part of header.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');

    if (rawKey === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
};

const queryString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

@Injectable()
export class OidcAuthService {
  private client?: Client;
  private clientKey?: string;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  isEnabled(): boolean {
    return this.twentyConfigService.get('AUTH_OIDC_ENABLED');
  }

  getCallbackUrl(): string {
    const configured = this.twentyConfigService.get('AUTH_OIDC_CALLBACK_URL');

    if (configured) {
      return configured;
    }

    const serverUrl = this.twentyConfigService
      .get('SERVER_URL')
      .replace(/\/+$/, '');

    return `${serverUrl}/auth/oidc/redirect`;
  }

  private async getClient(): Promise<Client> {
    const issuerUrl = this.twentyConfigService.get('AUTH_OIDC_ISSUER');
    const clientId = this.twentyConfigService.get('AUTH_OIDC_CLIENT_ID');
    const clientSecret = this.twentyConfigService.get('AUTH_OIDC_CLIENT_SECRET');
    const callbackUrl = this.getCallbackUrl();

    if (!issuerUrl || !clientId || !clientSecret) {
      throw new AuthException(
        'OIDC sign-in is not configured',
        AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE,
      );
    }

    const key = [issuerUrl, clientId, callbackUrl].join('|');

    if (this.client && this.clientKey === key) {
      return this.client;
    }

    const issuer = await Issuer.discover(issuerUrl);

    this.client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [callbackUrl],
      response_types: ['code'],
    });
    this.clientKey = key;

    return this.client;
  }

  async buildAuthorizationUrl(
    request: Request,
    response: Response,
  ): Promise<string> {
    const client = await this.getClient();

    const transaction: OidcTransaction = {
      state: generators.state(),
      nonce: generators.nonce(),
      codeVerifier: generators.codeVerifier(),
      social: {
        workspaceInviteHash: queryString(request.query.workspaceInviteHash),
        workspaceId: queryString(request.query.workspaceId),
        billingCheckoutSessionState: queryString(
          request.query.billingCheckoutSessionState,
        ),
        action: queryString(request.query.action) as
          | SocialSsoSignInUpActionType
          | undefined,
        locale: queryString(request.query.locale) as
          | SocialSsoState['locale']
          | undefined,
        returnToPath: queryString(request.query.returnToPath),
      },
    };

    response.cookie(OIDC_COOKIE_NAME, JSON.stringify(transaction), {
      httpOnly: true,
      secure: this.getCallbackUrl().startsWith('https://'),
      sameSite: 'lax',
      maxAge: OIDC_TRANSACTION_TTL_MS,
      path: OIDC_COOKIE_PATH,
    });

    return client.authorizationUrl({
      scope: this.twentyConfigService.get('AUTH_OIDC_SCOPES'),
      state: transaction.state,
      nonce: transaction.nonce,
      code_challenge: generators.codeChallenge(transaction.codeVerifier),
      code_challenge_method: 'S256',
    });
  }

  async handleCallback(
    request: Request,
    response: Response,
  ): Promise<OidcUser> {
    if (request.query.error === 'access_denied') {
      throw new AuthException(
        'OIDC sign-in was denied',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }

    const raw = readCookie(request, OIDC_COOKIE_NAME);

    response.clearCookie(OIDC_COOKIE_NAME, { path: OIDC_COOKIE_PATH });

    const transaction = raw ? parseJson<OidcTransaction>(raw) : undefined;

    if (!transaction?.state || !transaction.nonce || !transaction.codeVerifier) {
      throw new AuthException(
        'Sign-in session expired, please start again',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const client = await this.getClient();
    const params = client.callbackParams(request);
    const tokenSet = await client.callback(this.getCallbackUrl(), params, {
      state: transaction.state,
      nonce: transaction.nonce,
      code_verifier: transaction.codeVerifier,
    });
    const userinfo = await client.userinfo(tokenSet);

    const email =
      typeof userinfo.email === 'string' ? userinfo.email.trim() : '';

    if (!email) {
      throw new AuthException(
        'The identity provider did not return an email address',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (userinfo.email_verified === false) {
      throw new AuthException(
        'Please verify your email address with your identity provider',
        AuthExceptionCode.EMAIL_NOT_VERIFIED,
      );
    }

    const fullName =
      typeof userinfo.name === 'string' ? userinfo.name.trim() : '';
    const [nameFirst, ...nameRest] = fullName.split(/\s+/);

    const social = transaction.social ?? {};

    return {
      email,
      firstName: userinfo.given_name ?? nameFirst ?? null,
      lastName: userinfo.family_name ?? (nameRest.join(' ') || null),
      picture: typeof userinfo.picture === 'string' ? userinfo.picture : null,
      workspaceInviteHash: social.workspaceInviteHash,
      workspaceId: social.workspaceId,
      billingCheckoutSessionState: social.billingCheckoutSessionState,
      action: social.action ?? 'list-available-workspaces',
      locale: social.locale,
      returnToPath: social.returnToPath,
    };
  }
}
