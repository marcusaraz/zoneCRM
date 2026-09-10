import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventComposerFields } from '@/activities/calendar/components/CalendarEventComposerFields';
import { useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { type CalendarEventComposerInitialValues } from '@/activities/calendar/types/CalendarEventComposerInitialValues';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type SetMeetingFormProps = {
  initialValues: CalendarEventComposerInitialValues;
  onCreated: () => void;
};

/**
 * The form itself, mounted only once its opening values are known.
 *
 * The composer reads those values when it is first mounted and never again, so
 * this has to stay a separate component: a form built while the account and the
 * customer address were still being fetched would open empty and stay empty.
 */
export const SetMeetingForm = ({
  initialValues,
  onCreated,
}: SetMeetingFormProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { enqueueErrorSnackBar } = useSnackBar();

  const composerState = useCalendarEventComposer({ initialValues, onCreated });

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

  return (
    <>
      <CalendarEventComposerFields
        composerState={composerState}
        contextRecord={initialValues.contextRecord}
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
  );
};
