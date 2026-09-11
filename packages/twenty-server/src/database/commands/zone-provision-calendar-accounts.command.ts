import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ImapSmtpCaldavService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ImapSmtpCalDavApiService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type ZoneCalendarMember = WorkspaceMemberWorkspaceEntity & {
  directoryUsername?: string | null;
};

/**
 * Connect every colleague's calendar without asking them for anything.
 *
 * The calendar server lets one trusted account reach the calendars of everyone
 * else, so the CRM is given that account and each colleague's connection is
 * pointed at their own calendar home. They arrange a meeting and the invitation
 * goes out under their own name, having connected nothing and typed no password.
 *
 * It needs to know where a colleague's calendars live and who the CRM is on that
 * server. The address is a template rather than a base, because where a server
 * keeps someone's calendars is the server's business, not this command's:
 *   ZONE_CALDAV_HOME_TEMPLATE  https://calendar.example/dav/{username}/Calendar/
 *   ZONE_CALDAV_SERVICE_USER   zone-crm
 *   ZONE_CALDAV_SERVICE_SECRET
 *
 * A colleague is skipped when their record does not say what the directory calls
 * them, or when they have already connected a calendar of their own: a
 * connection someone made themselves is never replaced by this one.
 */
@Command({
  name: 'zone:calendar:provision',
  description:
    'Point each workspace member at their own calendar through the CRM service account',
})
export class ZoneProvisionCalendarAccountsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly imapSmtpCaldavService: ImapSmtpCaldavService,
    private readonly imapSmtpCaldavApisService: ImapSmtpCalDavApiService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const homeTemplate = process.env.ZONE_CALDAV_HOME_TEMPLATE ?? '';
    const serviceUser = process.env.ZONE_CALDAV_SERVICE_USER ?? '';
    const serviceSecret = process.env.ZONE_CALDAV_SERVICE_SECRET ?? '';

    if (
      !homeTemplate.includes('{username}') ||
      serviceUser === '' ||
      serviceSecret === ''
    ) {
      this.logger.log(
        'ZONE_CALDAV_HOME_TEMPLATE (containing {username}), ZONE_CALDAV_SERVICE_USER and ZONE_CALDAV_SERVICE_SECRET are not all set; nothing to do',
      );

      return;
    }

    const members = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repository =
          this.workspaceOrmManager.getRepository<ZoneCalendarMember>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return repository.find();
      },
      buildSystemAuthContext(workspaceId),
    );

    for (const member of members) {
      const directoryUsername = (member.directoryUsername ?? '').trim();
      const handle = (member.userEmail ?? '').trim();

      if (directoryUsername === '' || handle === '') {
        continue;
      }

      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: { userId: member.userId, workspaceId },
      });

      if (!isDefined(userWorkspace)) {
        this.logger.log(`${handle}: no membership record, skipped`);
        continue;
      }

      const existingAccounts =
        await this.connectedAccountMetadataService.findByUserWorkspaceId({
          userWorkspaceId: userWorkspace.id,
          workspaceId,
        });

      const hasCalendarAccount = existingAccounts.some(
        (account) =>
          account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
          isDefined(account.connectionParameters?.CALDAV),
      );

      if (hasCalendarAccount) {
        this.logger.log(`${handle}: already has a calendar, left alone`);
        continue;
      }

      const host = homeTemplate.replace('{username}', directoryUsername);

      if (options.dryRun === true) {
        this.logger.log(`${handle}: would be pointed at ${host}`);
        continue;
      }

      try {
        const validatedParams =
          await this.imapSmtpCaldavService.validateAndTestConnectionParameters({
            connectionParameters: {
              CALDAV: {
                host,
                port: 443,
                username: serviceUser,
                password: serviceSecret,
              },
            },
            handle,
            existingConnectionParameters: null,
          });

        await this.imapSmtpCaldavApisService.upsertConnectedAccount({
          handle,
          userWorkspaceId: userWorkspace.id,
          workspaceId,
          connectionParameters: validatedParams,
          existingAccount: null,
        });

        this.logger.log(`${handle}: pointed at ${host}`);
      } catch (error) {
        this.logger.log(
          `${handle}: could not be connected (${error instanceof Error ? error.message : 'unknown error'})`,
        );
      }
    }
  }
}
