import { styled } from '@linaria/react';
import { useSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useSelectFieldDisplay';
import { SelectDisplay } from 'twenty-ui/data-display';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Decision 14, Marcus on 14 September 2026: a select value is plain text in
// the reading ink. A status is the exception and keeps a quiet pill, because
// where a record stands is a thing people scan a list for and a pill is what
// the eye finds.
//
// These are the two he named. A field that ought to read as a status and does
// not is added here by its name; nothing else about it changes.
const STATUS_FIELD_NAMES = ['leadStatus', 'stage'];

// The revision he made the same day, and the only one: Owner keeps the colour
// its option was given. Who a record belongs to is read by scanning a column
// rather than by reading it, and a colour per person is what makes that work.
const COLOURED_FIELD_NAMES = ['owner'];

const StyledPlainValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useSelectFieldDisplay();

  const selectedOption = fieldDefinition.metadata.options?.find(
    (option) => option.value === fieldValue,
  );

  if (!isDefined(selectedOption)) {
    return <></>;
  }

  const fieldName = fieldDefinition.metadata.fieldName;
  const isStatus = STATUS_FIELD_NAMES.includes(fieldName);
  const shouldKeepColor = COLOURED_FIELD_NAMES.includes(fieldName);

  if (!isStatus && !shouldKeepColor) {
    return <StyledPlainValue>{selectedOption.label}</StyledPlainValue>;
  }

  // A status passes its colour and Tag ignores it, drawing the same quiet pill
  // for every one. Owner asks to keep it, and is the only field that does.
  return (
    <SelectDisplay
      color={selectedOption.color}
      label={selectedOption.label}
      shouldKeepColor={shouldKeepColor}
    />
  );
};
