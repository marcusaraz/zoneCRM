import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type DashboardChartSegment } from '@/dashboard/components/DashboardBarChart';

const RADIUS = 52;
const STROKE = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StyledChart = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const StyledRing = styled.div`
  flex-shrink: 0;
  position: relative;
`;

const StyledSvg = styled.svg`
  display: block;
  transform: rotate(-90deg);
`;

const StyledArc = styled.circle<{ isDimmed: boolean }>`
  cursor: pointer;
  opacity: ${({ isDimmed }) => (isDimmed ? 0.25 : 1)};
  transition:
    opacity ${themeCssVariables.animation.duration.fast} ease,
    stroke-dasharray ${themeCssVariables.animation.duration.normal} ease;
`;

const StyledCentre = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;
`;

const StyledCentreValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
`;

const StyledCentreLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  max-width: 84px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLegend = styled.ul`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  margin: 0;
  min-width: 0;
  padding: 0;
`;

const StyledLegendRow = styled.button<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected ? themeCssVariables.background.tertiary : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: grid;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 10px 1fr auto auto;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: -2px;
  }
`;

const StyledSwatch = styled.span<{ tone: string }>`
  background: ${({ tone }) => tone};
  border-radius: 3px;
  display: block;
  height: 10px;
  width: 10px;
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-variant-numeric: tabular-nums;
`;

const StyledShare = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-variant-numeric: tabular-nums;
  min-width: 2.5rem;
  text-align: right;
`;

type DashboardDonutProps = {
  segments: DashboardChartSegment[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  centreLabel: string;
};

/**
 * A share of a whole, which is the one thing a ring says better than a bar.
 *
 * The ring carries the proportions and the legend carries the numbers, because
 * nobody reads a value off an arc. Clicking either one opens what is behind it,
 * and the middle then reports the slice rather than the total.
 */
export const DashboardDonut = ({
  segments,
  selectedKey,
  onSelect,
  centreLabel,
}: DashboardDonutProps) => {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const selected = segments.find((segment) => segment.key === selectedKey);

  let travelled = 0;

  return (
    <StyledChart>
      <StyledRing>
        <StyledSvg width={140} height={140} viewBox="0 0 140 140">
          <circle
            cx={70}
            cy={70}
            r={RADIUS}
            fill="none"
            stroke={themeCssVariables.background.secondary}
            strokeWidth={STROKE}
          />
          {segments.map((segment) => {
            const length =
              total === 0 ? 0 : (segment.count / total) * CIRCUMFERENCE;
            const offset = -travelled;

            travelled += length;

            return (
              <StyledArc
                key={segment.key}
                cx={70}
                cy={70}
                r={RADIUS}
                fill="none"
                stroke={segment.tone}
                strokeWidth={STROKE}
                strokeDasharray={`${Math.max(length - 1, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={offset}
                isDimmed={selectedKey !== null && selectedKey !== segment.key}
                onClick={() =>
                  onSelect(selectedKey === segment.key ? null : segment.key)
                }
              />
            );
          })}
        </StyledSvg>
        <StyledCentre>
          <StyledCentreValue>
            {(selected?.count ?? total).toLocaleString()}
          </StyledCentreValue>
          <StyledCentreLabel>
            {selected?.label ?? centreLabel}
          </StyledCentreLabel>
        </StyledCentre>
      </StyledRing>

      <StyledLegend>
        {segments.map((segment) => (
          <li key={segment.key}>
            <StyledLegendRow
              type="button"
              isSelected={selectedKey === segment.key}
              aria-pressed={selectedKey === segment.key}
              onClick={() =>
                onSelect(selectedKey === segment.key ? null : segment.key)
              }
            >
              <StyledSwatch tone={segment.tone} />
              <StyledName>{segment.label}</StyledName>
              <StyledValue>{segment.count.toLocaleString()}</StyledValue>
              <StyledShare>
                {total === 0
                  ? '0%'
                  : `${Math.round((segment.count / total) * 100)}%`}
              </StyledShare>
            </StyledLegendRow>
          </li>
        ))}
      </StyledLegend>
    </StyledChart>
  );
};
