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
  service.assertApiKeyMayConnectMailbox({
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

    await expect(
      connect(service, 'naz@capital.works'),
    ).resolves.toBeUndefined();
  });

  it('forgives the case of the address, which is the same mailbox', async () => {
    const service = build({
      canUpdateAllSettings: true,
      email: 'naz@capital.works',
    });

    await expect(
      connect(service, '  Naz@Capital.Works '),
    ).resolves.toBeUndefined();
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

  it('refuses a member who is not in this workspace', async () => {
    const service = build({ canUpdateAllSettings: true, email: null });

    await expect(connect(service, 'naz@capital.works')).rejects.toThrow(
      'was not found in this workspace',
    );
  });
});
