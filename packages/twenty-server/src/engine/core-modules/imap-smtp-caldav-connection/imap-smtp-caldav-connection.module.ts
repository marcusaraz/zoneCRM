import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ImapSmtpCaldavValidatorModule } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { CalDavDriverModule } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/caldav-driver.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { IMAPAPIsModule } from 'src/modules/connected-account/imap-api/imap-apis.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

import { ImapSmtpCaldavResolver } from './imap-smtp-caldav-connection.resolver';

import { ImapSmtpCaldavApiKeyPolicyService } from './services/imap-smtp-caldav-api-key-policy.service';
import { ImapSmtpCaldavService } from './services/imap-smtp-caldav-connection.service';

@Module({
  imports: [
    ConnectedAccountModule,
    ConnectedAccountMetadataModule,
    ConnectedAccountTokenEncryptionModule,
    MessagingIMAPDriverModule,
    IMAPAPIsModule,
    MessagingImportManagerModule,
    MessageQueueModule,
    FeatureFlagModule,
    ImapSmtpCaldavValidatorModule,
    PermissionsModule,
    SecureHttpClientModule,
    CalDavDriverModule,
    TypeOrmModule.forFeature([RoleEntity, UserWorkspaceEntity]),
  ],
  providers: [
    ImapSmtpCaldavResolver,
    ImapSmtpCaldavService,
    ImapSmtpCaldavApiKeyPolicyService,
    provideWorkspaceScopedRepository(RoleEntity),
  ],
  exports: [ImapSmtpCaldavService],
})
export class ImapSmtpCaldavModule {}
