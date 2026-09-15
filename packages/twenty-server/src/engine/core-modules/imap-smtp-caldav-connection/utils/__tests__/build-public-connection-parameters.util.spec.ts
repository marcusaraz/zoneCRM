import { buildPublicConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-public-connection-parameters.util';
import { buildPublicConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/build-public-connected-account.util';

// GHSA-mq5c-qp77-2cv3, published 1 September 2026: before 2.7.0 the /metadata
// query returned connectionParameters with the mailbox password in it, to any
// member of the workspace. Twenty closed it by never serialising the stored
// parameters and handing callers this sanitised shape instead.
//
// Zone CRM added two ways in on top of that for C30: an API key may connect a
// colleague's mailbox, and may list what that colleague has connected. Neither
// returns the stored parameters, and every path that does return connection
// details goes through the two functions below. So these tests are the proof
// that no response carries a mailbox password: the password must not survive
// into the output under its own key, at any depth, or anywhere in its
// serialised text, whether it is stored as an envelope or as plain text.

const ENVELOPE = 'enc:v2:key-1:c2VjcmV0LXBheWxvYWQtdGhhdC1tdXN0LW5vdC1sZWFr';
const PLAINTEXT = 'plain-mailbox-password-that-must-not-leak';

const stored = (password: string) =>
  ({
    name: 'Work mailbox',
    IMAP: {
      host: 'imap.example.com',
      port: 993,
      username: 'member@example.com',
      password,
      connectionSecurity: 'SSL_TLS',
    },
    SMTP: {
      host: 'smtp.example.com',
      port: 465,
      username: 'member@example.com',
      password,
      connectionSecurity: 'SSL_TLS',
    },
    CALDAV: {
      host: 'caldav.example.com',
      port: 443,
      username: 'member@example.com',
      password,
    },
  }) as never;

const hasKeyAnywhere = (value: unknown, key: string): boolean => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([entryKey, entryValue]) =>
      entryKey === key || hasKeyAnywhere(entryValue, key),
  );
};

describe('buildPublicConnectionParameters', () => {
  it.each([
    ['an encrypted envelope', ENVELOPE],
    ['a plaintext value', PLAINTEXT],
  ])('drops the password of every protocol when it is %s', (_, password) => {
    const result = buildPublicConnectionParameters(stored(password));

    expect(hasKeyAnywhere(result, 'password')).toBe(false);
    expect(JSON.stringify(result)).not.toContain(password);
  });

  it('keeps what a caller legitimately needs', () => {
    const result = buildPublicConnectionParameters(stored(ENVELOPE));

    expect(result).toEqual({
      name: 'Work mailbox',
      IMAP: {
        host: 'imap.example.com',
        port: 993,
        username: 'member@example.com',
        connectionSecurity: 'SSL_TLS',
      },
      SMTP: {
        host: 'smtp.example.com',
        port: 465,
        username: 'member@example.com',
        connectionSecurity: 'SSL_TLS',
      },
      CALDAV: {
        host: 'caldav.example.com',
        port: 443,
        username: 'member@example.com',
      },
    });
  });

  it('does not strip the password from what is stored', () => {
    const input = stored(ENVELOPE) as unknown as {
      IMAP: { password: string };
    };

    buildPublicConnectionParameters(input as never);

    expect(input.IMAP.password).toBe(ENVELOPE);
  });

  it('returns nothing for an account with no parameters', () => {
    expect(buildPublicConnectionParameters(null)).toBeNull();
    expect(buildPublicConnectionParameters(undefined)).toBeNull();
  });
});

describe('buildPublicConnectedAccount', () => {
  it('hands back an account whose parameters carry no password', () => {
    const account = {
      id: 'account-id',
      handle: 'member@example.com',
      provider: 'imap_smtp_caldav',
      connectionParameters: stored(ENVELOPE),
    } as never;

    const result = buildPublicConnectedAccount(account);

    expect(hasKeyAnywhere(result.connectionParameters, 'password')).toBe(false);
    expect(JSON.stringify(result.connectionParameters)).not.toContain(ENVELOPE);
  });

  it('returns nothing for no account', () => {
    expect(buildPublicConnectedAccount(null)).toBeNull();
  });
});
