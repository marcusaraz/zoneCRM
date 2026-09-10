import { t } from '@lingui/core/macro';

type PhoneCallEventFields = {
  direction?: string | null;
  status?: string | null;
  talkTimeInSeconds?: number | null;
};

// How long the two sides were on the line, in the shortest honest form.
const formatTalkTime = (seconds: number): string => {
  if (seconds < 60) {
    return t`${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return rest === 0 ? t`${minutes}m` : t`${minutes}m ${rest}s`;
};

// A call reads as one line: which way it went, whether anyone picked up, and how
// long it lasted. The date sits at the end of the row already.
export const getPhoneCallEventText = ({
  direction,
  status,
  talkTimeInSeconds,
}: PhoneCallEventFields): string => {
  const opening =
    direction === 'OUTGOING' ? t`Outgoing call` : t`Incoming call`;

  switch (status) {
    case 'ANSWERED': {
      const seconds = talkTimeInSeconds ?? 0;

      return seconds > 0
        ? `${opening} · ${t`answered`} · ${formatTalkTime(seconds)}`
        : `${opening} · ${t`answered`}`;
    }
    case 'BUSY':
      return `${opening} · ${t`busy`}`;
    case 'FAILED':
      return `${opening} · ${t`failed`}`;
    case 'NO_ANSWER':
      return `${opening} · ${t`no answer`}`;
    default:
      return opening;
  }
};
