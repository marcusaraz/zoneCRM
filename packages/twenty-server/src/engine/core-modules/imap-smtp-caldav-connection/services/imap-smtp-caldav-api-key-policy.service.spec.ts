import { ImapSmtpCaldavApiKeyPolicyService } from './imap-smtp-caldav-api-key-policy.service';

// Decision 12 asked for a test of each gate: another member address is
// refused, and a key that is not an admin is refused. Both are here, with the
// case that should pass beside them so a refusal that refuses everything
// cannot go unnoticed.

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const API_KEY_ID = 'api-key-id';

const build = ({
  canUpdateAllSettings,
  email,
}: {
  canUpdateAllSettings: boolean;
  email: string | null;
}) => {
  const apiKeyRoleService = {
    getRoleIdForApiKeyId: jest.fn().mockResolvedValue('role-id'),
  };
  const roleRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 'role-id', canUpdateAllSettings }),
  };
  const userWorkspaceRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue(
        email === null ? null : { id: USER_WORKSPACE_ID, user: { email } },
      ),
  };

  return new ImapSmtpCaldavApiKeyPolicyService(
    apiKeyRoleService as never,
    roleRepository as never,
    userWorkspaceRepository as never,
  );
};

const connect = (service: ImapSmtpCaldavApiKeyPolicyService, handle: string) =>
  service.resolveMemberForApiKey({
    apiKeyId: API_KEY_ID,
    workspaceId: WORKSPACE_ID,
    userWorkspaceId: USER_WORKSPACE_ID,
    handle,
  });

describe('ImapSmtpCaldavApiKeyPolicyService', () => {
  it('lets an admin key connect the member own address', async () => {
    const service = build({
      canUpdateAllSettings: true,
      email: 'naz@capital.works',
    });

    await expect(connect(service, 'naz@capital.works')).resolves.toBe(
      USER_WORKSPACE_ID,
    );
  });

  it('forgives the case of the address, which is the same mailbox', async () => {
    const service = build({
      canUpdateAllSettings: true,
      email: 'naz@capital.works',
    });

    await expect(connect(service, '  Naz@Capital.Works ')).resolves.toBe(
      USER_WORKSPACE_ID,
    );
  });

  it('refuses another member address', async () => {
    const service = build({
      canUpdateAllSettings: true,
      email: 'naz@capital.works',
    });

    await expect(connect(service, 'marcus@capital.works')).rejects.toThrow(
      'must be that member own address',
    );
  });

  it('refuses a key whose role is not an admin', async () => {
    const service = build({
      canUpdateAllSettings: false,
      email: 'naz@capital.works',
    });

    await expect(connect(service, 'naz@capital.works')).rejects.toThrow(
      'admin role',
    );
  });

  it('finds the member from the address, with nothing else passed', async () => {
    const service = build({
      canUpdateAllSettings: true,
      email: 'naz@capital.works',
    });

    await expect(
      service.resolveMemberForApiKey({
        apiKeyId: API_KEY_ID,
        workspaceId: WORKSPACE_ID,
        handle: 'naz@capital.works',
      }),
    ).resolves.toBe(USER_WORKSPACE_ID);
  });

  it('refuses a member who is not in this workspace', async () => {
    const service = build({ canUpdateAllSettings: true, email: null });

    await expect(connect(service, 'naz@capital.works')).rejects.toThrow(
      'was not found in this workspace',
    );
  });
});

// Reading what is connected for a colleague carries the same gate as writing
// it, so it is tested the same way: an admin key may ask about anybody, a
// signed-in person about themselves and nobody else.
describe('ImapSmtpCaldavApiKeyPolicyService, reading', () => {
  it('lets an admin key ask about a colleague', async () => {
    const service = build({
      canUpdateAllSettings: true,
      email: 'naz@capital.works',
    });

    await expect(
      service.resolveMemberForReader({
        apiKeyId: API_KEY_ID,
        workspaceId: WORKSPACE_ID,
        handle: 'naz@capital.works',
      }),
    ).resolves.toBe(USER_WORKSPACE_ID);
  });

  it('refuses a key whose role is not an admin', async () => {
    const service = build({
      canUpdateAllSettings: false,
      email: 'naz@capital.works',
    });

    await expect(
      service.resolveMemberForReader({
        apiKeyId: API_KEY_ID,
        workspaceId: WORKSPACE_ID,
        handle: 'naz@capital.works',
      }),
    ).rejects.toThrow('admin role');
  });

  it('lets a signed-in person ask about themselves', async () => {
    const service = build({
      canUpdateAllSettings: false,
      email: 'naz@capital.works',
    });

    await expect(
      service.resolveMemberForReader({
        sessionUserWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
        handle: 'naz@capital.works',
      }),
    ).resolves.toBe(USER_WORKSPACE_ID);
  });

  it('refuses a signed-in person asking about somebody else', async () => {
    const service = build({
      canUpdateAllSettings: false,
      email: 'naz@capital.works',
    });

    await expect(
      service.resolveMemberForReader({
        sessionUserWorkspaceId: 'a-different-member',
        workspaceId: WORKSPACE_ID,
        handle: 'naz@capital.works',
      }),
    ).rejects.toThrow('needs an API key with an admin role');
  });
});
