import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getMissingCreateCalendarEventScopes } from '@/accounts/utils/hasMissingCreateCalendarEventScopes';
import { CalendarEventComposerFields } from '@/activities/calendar/components/CalendarEventComposerFields';
import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { isCalendarCreationEnabledForAccount } from '@/activities/calendar/utils/isCalendarCreationEnabledForAccount';
import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 ${themeCssVariables.spacing[2]};
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
 * The tab used to be a list of past meetings and a button that opened the form
 * somewhere else. Arranging a meeting is what the tab is opened for, so the form
 * is the tab: the invitation comes from whichever of your own accounts you
 * choose, and the customer is already on it. What has already been arranged
 * stays underneath.
 */
export const SetMeetingCard = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { userTimezone } = useUserTimezone();
  const navigateSettings = useNavigateSettings();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { accounts, loading: accountsLoading } = useMyConnectedAccounts();

  const {
    defaultRecipientPersonId,
    defaultTo,
    loading: recipientLoading,
  } = useResolveDefaultEmailRecipient({
    objectNameSingular: targetRecord.targetObjectNameSingular,
    recordId: targetRecord.id,
  });

  const calendarAccounts = accounts.filter(isCalendarCreationEnabledForAccount);
  // The one that can already create events, so the form opens ready rather than
  // opening on a question.
  const preferredAccount =
    calendarAccounts.find(
      (account) => getMissingCreateCalendarEventScopes(account).length === 0,
    ) ?? calendarAccounts[0];

  const composerState = useCalendarEventComposer({
    initialValues: isDefined(preferredAccount)
      ? {
          connectedAccountId: preferredAccount.id,
          contextRecord: {
            objectNameSingular: targetRecord.targetObjectNameSingular,
            recordId: targetRecord.id,
          },
          defaultAttendees: defaultTo ?? '',
          defaultAttendeePersonId: defaultRecipientPersonId,
          timeZone: userTimezone,
        }
      : null,
    onCreated: () => {},
  });

  const handleAddAccount = () => {
    navigateSettings(SettingsPath.NewAccount);
  };

  const handleReauthorize = async () => {
    const selectedAccount = composerState.selectedAccount;

    if (
      !isDefined(selectedAccount) ||
      selectedAccount.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV
    ) {
      return;
    }

    try {
      await triggerApisOAuth(selectedAccount.provider, {
        redirectLocation: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        loginHint: selectedAccount.handle,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to reconnect calendar account`,
      });
    }
  };

  const isReady =
    !accountsLoading && !recipientLoading && !composerState.accountsLoading;

  return (
    <StyledContainer>
      {!isReady && <StyledNotice>{t`Loading your calendar…`}</StyledNotice>}
      {isReady && !isDefined(preferredAccount) && (
        <StyledNotice>
          {t`Connect a calendar account under Settings to arrange meetings from here.`}
        </StyledNotice>
      )}
      {isReady && isDefined(preferredAccount) && (
        <>
          <CalendarEventComposerFields
            composerState={composerState}
            contextRecord={{
              objectNameSingular: targetRecord.targetObjectNameSingular,
              recordId: targetRecord.id,
            }}
            onAddAccount={handleAddAccount}
            onReauthorize={handleReauthorize}
          />
          <StyledActions>
            <Button
              size="small"
              variant="primary"
              accent="blue"
              title={t`Create event`}
              Icon={IconCalendarEvent}
              onClick={composerState.handleCreate}
              disabled={!composerState.canCreate}
            />
          </StyledActions>
        </>
      )}
      <StyledPastMeetings>
        <StyledHeading>{t`Meetings`}</StyledHeading>
        <CalendarEventsCard />
      </StyledPastMeetings>
    </StyledContainer>
  );
};
