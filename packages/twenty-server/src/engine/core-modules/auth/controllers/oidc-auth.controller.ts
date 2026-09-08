import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { OidcProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/oidc-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { OidcAuthService } from 'src/engine/core-modules/auth/services/oidc-auth.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller(`${ApiPath.Auth}/oidc`)
@UseFilters(AuthRestApiExceptionFilter)
export class OidcAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oidcAuthService: OidcAuthService,
  ) {}

  @Get()
  @UseGuards(OidcProviderEnabledGuard, PublicEndpointGuard, NoPermissionGuard)
  @UseFilters(AuthOAuthExceptionFilter)
  async oidcAuth(@Req() req: Request, @Res() res: Response) {
    return res.redirect(
      await this.oidcAuthService.buildAuthorizationUrl(req, res),
    );
  }

  @Get('redirect')
  @UseGuards(OidcProviderEnabledGuard, PublicEndpointGuard, NoPermissionGuard)
  @UseFilters(AuthOAuthExceptionFilter)
  async oidcAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = await this.oidcAuthService.handleCallback(req, res);

    return res.redirect(
      await this.authService.signInUpWithSocialSso(
        user,
        AuthProviderEnum.Oidc,
      ),
    );
  }
}
