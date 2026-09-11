import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFallback = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
  padding: ${themeCssVariables.spacing[6]};
`;

const DashboardCardFallback = () => {
  const { t } = useLingui();

  return <StyledFallback>{t`This did not load.`}</StyledFallback>;
};

/**
 * One card failing should cost one card.
 *
 * This is the first screen after signing in, and a throw anywhere in it takes
 * the whole application down to a white page. Each card is fenced off so the
 * rest of the dashboard survives whatever one of them runs into.
 */
export const DashboardCardBoundary = ({
  children,
}: {
  children: ReactNode;
}) => (
  <ErrorBoundary FallbackComponent={DashboardCardFallback}>
    {children}
  </ErrorBoundary>
);
