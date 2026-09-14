import { styled } from '@linaria/react';
import { useContext } from 'react';
import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';

import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import {
  AppTooltip,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/surfaces';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from './RecordInlineCellContext';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  width: 16px;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledLabelAndIconContainer = styled.div<{ stacked?: boolean }>`
  align-items: center;
  align-self: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${({ stacked }) => (stacked ? 'auto' : '24px')};
`;

const StyledValueContainer = styled.div<{
  readonly: boolean;
  stacked?: boolean;
}>`
  display: flex;
  min-width: 0;
  position: relative;
  user-select: text;
  width: 100%;

  // Body type, MASTER.md: 15px on a 13px root.
  font-size: ${({ stacked }) => (stacked ? '1.15rem' : 'inherit')};
`;

const StyledLabelContainer = styled.div<{ width?: number; stacked?: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  width: ${({ width, stacked }) =>
    stacked ? 'auto' : width !== undefined ? `${width}px` : 'auto'};

  // Label type, MASTER.md: 12px, 600, uppercase, 0.04em. A label that sits above
  // its value has to be told apart from the value by its shape, not by distance.
  font-weight: ${({ stacked }) => (stacked ? '600' : 'inherit')};
  letter-spacing: ${({ stacked }) => (stacked ? '0.04em' : 'normal')};
  text-transform: ${({ stacked }) => (stacked ? 'uppercase' : 'none')};
`;

const StyledInlineCellBaseContainer = styled.div<{
  readonly: boolean;
  stacked?: boolean;
}>`
  align-items: ${({ stacked }) => (stacked ? 'stretch' : 'center')};
  box-sizing: border-box;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  flex-direction: ${({ stacked }) => (stacked ? 'column' : 'row')};
  gap: ${themeCssVariables.spacing[1]};
  height: fit-content;
  user-select: none;
  width: 100%;

  // Twelve above and twelve below, with the hairline the card draws between
  // rows falling exactly halfway between one value and the next label.
  padding: ${({ stacked }) => (stacked ? '12px 0' : '0')};
`;

export const StyledSkeletonDiv = styled.div`
  height: 24px;
`;

export const RecordInlineCellContainer = () => {
  const { readonly, IconLabel, label, labelWidth, showLabel, isStacked } =
    useRecordInlineCellContext();
  const { theme } = useContext(ThemeContext);

  const { recordId, fieldDefinition, onMouseEnter, onMouseLeave, anchorId } =
    useContext(FieldContext);

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);
  }

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
    onMouseEnter?.();
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
    onMouseLeave?.();
  };

  const labelId = `label-${getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldDefinition?.metadata?.fieldName,
  })}`;

  return (
    <StyledInlineCellBaseContainer
      readonly={readonly ?? false}
      stacked={isStacked}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {(IconLabel || label) && (
        <StyledLabelAndIconContainer
          stacked={isStacked}
          id={!showLabel ? labelId : undefined}
        >
          {/* A stacked label is already its own line, so the icon that told a
              row's label from its value has nothing left to do. */}
          {IconLabel && isStacked !== true && (
            <StyledIconContainer>
              <IconLabel stroke={theme.icon.stroke.sm} />
            </StyledIconContainer>
          )}
          {showLabel && (
            <StyledLabelContainer width={labelWidth} stacked={isStacked}>
              <FieldDescriptionTooltip
                label={label}
                description={fieldDefinition?.metadata?.description}
                fallback={
                  <OverflowingTextWithTooltip
                    text={label}
                    displayedMaxRows={1}
                  />
                }
              />
            </StyledLabelContainer>
          )}
          {/* TODO: Displaying Tooltips on the board is causing performance issues https://react-tooltip.com/docs/examples/render */}
          {!showLabel && (
            <AppTooltip
              anchorSelect={`#${labelId}`}
              title={label}
              interactive
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          )}
        </StyledLabelAndIconContainer>
      )}
      <StyledValueContainer
        readonly={readonly ?? false}
        stacked={isStacked}
        id={anchorId}
      >
        <RecordInlineCellValue />
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
