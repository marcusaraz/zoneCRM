import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[6]};
`;

const StyledRow = styled.button<{ isSelected: boolean; isEmpty: boolean }>`
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected ? themeCssVariables.background.tertiary : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: grid;
  font-family: ${themeCssVariables.font.family};
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(7rem, 11rem) 1fr 3rem;
  opacity: ${({ isEmpty }) => (isEmpty ? 0.55 : 1)};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
  transition: background ${themeCssVariables.animation.duration.fast} ease;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: -2px;
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTrack = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  display: block;
  height: 8px;
  overflow: hidden;
  width: 100%;
`;

const StyledBar = styled.span<{ share: number; tone: string }>`
  background: ${({ tone }) => tone};
  border-radius: ${themeCssVariables.border.radius.pill};
  display: block;
  height: 100%;
  min-width: ${({ share }) => (share > 0 ? '3px' : '0')};
  transition: width ${themeCssVariables.animation.duration.normal} ease;
  width: ${({ share }) => share}%;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
  text-align: right;
`;

export type DashboardChartSegment = {
  key: string;
  label: string;
  count: number;
  tone: string;
  // What to print at the end of the bar, when the number is not a plain count.
  display?: string;
};

type DashboardBarChartProps = {
  segments: DashboardChartSegment[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
};

// Bars are for seeing the shape; the list behind one is for doing something
// about it, so every bar is a button.
export const DashboardBarChart = ({
  segments,
  selectedKey,
  onSelect,
}: DashboardBarChartProps) => {
  const largest = Math.max(...segments.map((segment) => segment.count), 1);

  return (
    <StyledChart>
      {segments.map((segment) => (
        <StyledRow
          key={segment.key}
          type="button"
          isSelected={selectedKey === segment.key}
          isEmpty={segment.count === 0}
          aria-pressed={selectedKey === segment.key}
          onClick={() =>
            onSelect(selectedKey === segment.key ? null : segment.key)
          }
        >
          <StyledLabel>{segment.label}</StyledLabel>
          <StyledTrack>
            <StyledBar
              share={Math.round((segment.count / largest) * 100)}
              tone={segment.tone}
            />
          </StyledTrack>
          <StyledCount>
            {segment.display ?? segment.count.toLocaleString()}
          </StyledCount>
        </StyledRow>
      ))}
    </StyledChart>
  );
};
