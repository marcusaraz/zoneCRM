import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowItemProps = {
  children: ReactNode;
  variant?: 'column' | 'action';
};

// Body type, MASTER.md: 15px on a 13px root, which is what the Stitch person
// record sets on every timeline entry.
const StyledColumn = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: 1.15rem;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAction = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: 1.15rem;
  gap: ${themeCssVariables.spacing[1]};
`;

export const EventRowItem = ({
  children,
  variant = 'column',
}: EventRowItemProps) => {
  if (variant === 'action') {
    return <StyledAction>{children}</StyledAction>;
  }

  return <StyledColumn>{children}</StyledColumn>;
};
