import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useEffect, useRef } from 'react';
import { IconSearch, IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledField = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  transition: border-color ${themeCssVariables.animation.duration.fast} ease;
  width: 100%;

  &:focus-within {
    border-color: ${themeCssVariables.border.color.blue};
  }
`;

const StyledIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.xl};
  min-width: 0;
  outline: none;
  padding: 0;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledClearButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: 1px;
  }
`;

type SearchPageInputProps = {
  value: string;
  onChange: (value: string) => void;
};

// The one thing on the page that should already be waiting for you.
export const SearchPageInput = ({ value, onChange }: SearchPageInputProps) => {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <StyledField>
      <StyledIcon>
        <IconSearch size={20} />
      </StyledIcon>
      <StyledInput
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={t`Search people, companies, notes, tasks`}
        aria-label={t`Search`}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
      {value !== '' && (
        <StyledClearButton
          type="button"
          aria-label={t`Clear search`}
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
        >
          <IconX size={16} />
        </StyledClearButton>
      )}
    </StyledField>
  );
};
