import { Injectable } from '@nestjs/common';

import { DAVClient } from 'tsdav';
import { isDefined } from 'twenty-shared/utils';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { createBasicDigestAuthFetch } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/auth/create-basic-digest-auth-fetch';

type CalDavConnectionParams = {
  serverUrl: string;
  username: string;
  password: string;
};

/**
 * The calendar home named in the address, if it names one.
 *
 * Discovery asks the server "where are my calendars" and the server answers for
 * whoever authenticated. That is the wrong answer when one account writes into
 * another person's calendar on their behalf, which is how Zone CRM arranges a
 * meeting for a colleague who has connected nothing themselves. An address that
 * points past the root is taken at its word.
 */
const getConfiguredHomeUrl = (serverUrl: string): string | undefined => {
  try {
    const url = new URL(serverUrl);

    if (url.pathname === '' || url.pathname === '/') {
      return undefined;
    }

    return url.pathname.endsWith('/') ? url.href : `${url.href}/`;
  } catch {
    return undefined;
  }
};

@Injectable()
export class CalDavClientService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async getClient(input: CalDavConnectionParams): Promise<DAVClient> {
    const ssrfSafeFetch = this.secureHttpClientService.createSsrfSafeFetch();
    const fetch = createBasicDigestAuthFetch(
      input.username,
      input.password,
      ssrfSafeFetch,
    );

    const client = new DAVClient({
      serverUrl: input.serverUrl,
      credentials: { username: input.username, password: input.password },
      authMethod: 'Custom',
      // our fetch handles Basic+Digest itself; no-op authFunction so tsdav doesn't add its own header on top
      authFunction: async () => ({}),
      defaultAccountType: 'caldav',
      fetch,
    });

    await client.login();

    const configuredHomeUrl = getConfiguredHomeUrl(input.serverUrl);

    if (isDefined(configuredHomeUrl) && isDefined(client.account)) {
      client.account.homeUrl = configuredHomeUrl;
    }

    return client;
  }
}
