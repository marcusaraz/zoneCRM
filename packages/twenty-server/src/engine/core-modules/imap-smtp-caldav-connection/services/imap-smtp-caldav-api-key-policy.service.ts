import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Zone CRM, decision 12 (Marcus, 14 September 2026): "Aç. Bağlanan adres, o
// çalışanın kendi e-postasıyla aynı olmak zorunda."
//
// Connecting a mailbox is normally a thing a person does for themselves in
// their own settings, and the mutation refuses an API key outright. Onboarding
// a colleague has to do it for them, so the key is let in behind two gates,
// and both are here rather than in the resolver so that both can be tested:
//
//   1. the key must carry a role that may update all settings, which is what
//      an admin role is in this codebase. A key with a narrower role can read
//      and write records and still not attach a mailbox to somebody;
//   2. the address being connected must be that colleague's own address. A key
//      cannot point somebody else's mailbox at a member, which is the thing
//      worth being afraid of here: it would put another person's mail into
//      this member's timeline.
//
// Passwords are not this service's business: it never sees them. It decides
// only whether this key may connect this address for this member.

@Injectable()
export class ImapSmtpCaldavApiKeyPolicyService {
  constructor(
    private readonly apiKeyRoleService: ApiKeyRoleService,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async assertApiKeyMayConnectMailbox({
    apiKeyId,
    workspaceId,
    userWorkspaceId,
    handle,
  }: {
    apiKeyId: string;
    workspaceId: string;
    userWorkspaceId: string;
    handle: string;
  }): Promise<void> {
    const roleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
      apiKeyId,
      workspaceId,
    );

    const role = await this.roleRepository.findOne(workspaceId, {
      where: { id: roleId },
    });

    if (!isDefined(role) || role.canUpdateAllSettings !== true) {
      throw new UserInputError(
        'Connecting a mailbox for another member needs an API key with an admin role.',
      );
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
      relations: ['user'],
    });

    if (!isDefined(userWorkspace) || !isDefined(userWorkspace.user)) {
      throw new UserInputError(
        'That workspace member was not found in this workspace.',
      );
    }

    // Addresses are stored lowercased on the user, and a mailbox typed with a
    // capital letter is the same mailbox. Case is the only thing forgiven.
    const connecting = handle.trim().toLowerCase();
    const own = userWorkspace.user.email.trim().toLowerCase();

    if (connecting !== own) {
      throw new UserInputError(
        'The mailbox being connected must be that member own address.',
      );
    }
  }
}
