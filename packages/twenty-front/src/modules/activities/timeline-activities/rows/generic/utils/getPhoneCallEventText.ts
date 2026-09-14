import { t } from '@lingui/core/macro';

type PhoneCallEventFields = {
  direction?: string | null;
  status?: string | null;
  talkTimeInSeconds?: number | null;
  handledByName?: string | null;
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

// A call reads as one line: who was on it, whether anyone picked up, and how
// long it lasted. The date sits at the end of the row already, and the arrow
// beside it already says which way the call went, so the words are spent on
// the one thing neither of those shows: the colleague. A call with nobody
// against it falls back to the plain wording rather than inventing one.
export const getPhoneCallEventText = ({
  direction,
  status,
  talkTimeInSeconds,
  handledByName,
}: PhoneCallEventFields): string => {
  const who = (handledByName ?? '').trim();

  const opening =
    direction === 'OUTGOING'
      ? who !== ''
        ? t`${who} called`
        : t`Outgoing call`
      : status !== 'ANSWERED'
        ? t`Missed call`
        : who !== ''
          ? t`${who} answered`
          : t`Incoming call`;

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
      return direction === 'OUTGOING'
        ? `${opening} · ${t`no answer`}`
        : opening;
    default:
      return opening;
  }
};
