import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  type AnimatedPlaceholderType,
} from 'twenty-ui/feedback';
import { type IconComponent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

const StyledEmptyStateContainer = styled.div`
  height: 100%;
  width: 100%;
`;

type RecordIndexEmptyStateDisplayProps = {
  // Zone CRM: kept so every caller stays unchanged; an empty page is words now.
  animatedPlaceholderType?: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
  ButtonIcon?: IconComponent;
  buttonTitle?: string;
  onButtonClick?: () => void;
  width?: number;
};

export const RecordIndexEmptyStateDisplay = ({
  title,
  subTitle,
  ButtonIcon,
  buttonTitle,
  onButtonClick,
  width,
}: RecordIndexEmptyStateDisplayProps) => (
  <StyledEmptyStateContainer>
    <AnimatedPlaceholderEmptyContainer width={width}>
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {subTitle}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      {isDefined(onButtonClick) && (
        <Button
          Icon={ButtonIcon}
          title={buttonTitle}
          variant="secondary"
          onClick={onButtonClick}
        />
      )}
    </AnimatedPlaceholderEmptyContainer>
  </StyledEmptyStateContainer>
);
