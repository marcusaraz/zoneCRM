import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getMissingCreateCalendarEventScopes } from '@/accounts/utils/hasMissingCreateCalendarEventScopes';
import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { SetMeetingForm } from '@/activities/calendar/components/SetMeetingForm';
import { isCalendarCreationEnabledForAccount } from '@/activities/calendar/utils/isCalendarCreationEnabledForAccount';
import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledPastMeetings = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[4]};
`;

const StyledHeading = styled.h3`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-transform: uppercase;
`;

const StyledNotice = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
`;

/**
 * The meeting form, on the record it is about.
 *
 * The tab used to be a list of past meetings with the form hidden behind a
 * button somewhere else. Arranging a meeting is what the tab is opened for, so
 * the form is the tab: the invitation goes out from whichever of your own
 * accounts you pick, the customer is already on it, and what has already been
 * arranged sits underneath.
 */
export const SetMeetingCard = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { userTimezone } = useUserTimezone();
  const { accounts, loading: accountsLoading } = useMyConnectedAccounts();

  // Creating one event should not leave the last one's words in the boxes, and
  // remounting the form is what gives it a clean sheet.
  const [formGeneration, setFormGeneration] = useState(0);

  const {
    defaultRecipientPersonId,
    defaultTo,
    loading: recipientLoading,
  } = useResolveDefaultEmailRecipient({
    objectNameSingular: targetRecord.targetObjectNameSingular,
    recordId: targetRecord.id,
  });

  const calendarAccounts = accounts.filter(isCalendarCreationEnabledForAccount);
  // The account that can already create events, so the form opens ready rather
  // than opening on a question.
  const preferredAccount =
    calendarAccounts.find(
      (account) => getMissingCreateCalendarEventScopes(account).length === 0,
    ) ?? calendarAccounts[0];

  const isLoading = accountsLoading || recipientLoading;

  return (
    <StyledContainer>
      {isLoading && <StyledNotice>{t`Loading your calendar…`}</StyledNotice>}
      {!isLoading && !isDefined(preferredAccount) && (
        <StyledNotice>
          {t`Connect a calendar account in Settings to arrange meetings from here.`}
        </StyledNotice>
      )}
      {!isLoading && isDefined(preferredAccount) && (
        <SetMeetingForm
          key={`${targetRecord.id}-${formGeneration}`}
          initialValues={{
            connectedAccountId: preferredAccount.id,
            contextRecord: {
              objectNameSingular: targetRecord.targetObjectNameSingular,
              recordId: targetRecord.id,
            },
            defaultAttendees: defaultTo ?? '',
            defaultAttendeePersonId: defaultRecipientPersonId,
            timeZone: userTimezone,
          }}
          onCreated={() => setFormGeneration((previous) => previous + 1)}
        />
      )}
      <StyledPastMeetings>
        <StyledHeading>{t`Meetings`}</StyledHeading>
        <CalendarEventsCard />
      </StyledPastMeetings>
    </StyledContainer>
  );
};
