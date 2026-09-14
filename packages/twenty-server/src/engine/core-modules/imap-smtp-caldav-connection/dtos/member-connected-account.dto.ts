import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// What is connected for one colleague, and nothing about how. Onboarding asks
// this to find out whether a mailbox still needs connecting and which account
// to update rather than add beside, so it needs the id, the address and which
// kind of account it is. Hosts, ports and usernames are not in here, and
// passwords are nowhere: they are written and never read back.
@ObjectType('MemberConnectedAccount')
export class MemberConnectedAccountDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  provider: ConnectedAccountProvider;
}
