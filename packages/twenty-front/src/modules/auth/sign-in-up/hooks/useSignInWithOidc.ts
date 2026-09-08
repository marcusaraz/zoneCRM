import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { type SocialSsoSignInUpActionType } from '@/auth/types/socialSsoSignInUp.type';

export const useSignInWithOidc = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;

  const { signInWithOidc } = useAuth();

  return {
    signInWithOidc: ({ action }: { action: SocialSsoSignInUpActionType }) =>
      signInWithOidc({
        workspaceInviteHash,
        workspacePersonalInviteToken,
        action,
      }),
  };
};
