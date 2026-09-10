import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  type AnimatedPlaceholderType,
} from 'twenty-ui/feedback';

type CallRecordingWidgetEmptyStateDisplayProps = {
  // Zone CRM: kept so every caller stays unchanged; an empty page is words now.
  animatedPlaceholderType?: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
};

export const CallRecordingWidgetEmptyStateDisplay = ({
  title,
  subTitle,
}: CallRecordingWidgetEmptyStateDisplayProps) => (
  <AnimatedPlaceholderEmptyContainer>
    <AnimatedPlaceholderEmptyTextContainer>
      <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
      <AnimatedPlaceholderEmptySubTitle>
        {subTitle}
      </AnimatedPlaceholderEmptySubTitle>
    </AnimatedPlaceholderEmptyTextContainer>
  </AnimatedPlaceholderEmptyContainer>
);
