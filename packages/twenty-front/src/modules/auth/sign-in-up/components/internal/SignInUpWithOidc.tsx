import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSignInWithOidc } from '@/auth/sign-in-up/hooks/useSignInWithOidc';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { type SocialSsoSignInUpActionType } from '@/auth/types/socialSsoSignInUp.type';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { memo, useContext } from 'react';
import { IconKey } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';

// Zone CRM: the server-wide OpenID Connect provider (the company's own sign-in).

const OidcIcon = memo(() => {
  const { theme } = useContext(ThemeContext);
  return <IconKey size={theme.icon.size.md} />;
});

export const SignInUpWithOidc = ({
  action,
  isGlobalScope,
}: {
  action: SocialSsoSignInUpActionType;
  isGlobalScope?: boolean;
}) => {
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const authProviders = useAtomStateValue(authProvidersState);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useAtomState(
    lastAuthenticatedMethodState,
  );
  const { signInWithOidc } = useSignInWithOidc();
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const handleClick = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.OIDC);
    signInWithOidc({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.OIDC;
  const label = authProviders.oidcLabel || 'Continue with single sign-on';

  return (
    <>
      <StyledSsoButtonContainer>
        <MainButton
          Icon={OidcIcon}
          title={label}
          onClick={handleClick}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && (isGlobalScope || hasMultipleAuthMethods) && (
          <LastUsedPill />
        )}
      </StyledSsoButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
