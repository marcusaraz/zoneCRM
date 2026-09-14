import { type IconComponent } from '@ui/icon/types/IconComponent';
import { Tag } from '@ui/data-display/Tag/Tag';
import { type ThemeColor } from '@ui/theme';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
  preventPadding?: boolean;
  // Decision 14's one exception, Owner, asks for it by name. Everything else
  // draws the same quiet pill whatever colour its option was given.
  shouldKeepColor?: boolean;
};

export const SelectDisplay = ({
  color,
  label,
  Icon,
  preventPadding,
  shouldKeepColor,
}: SelectDisplayProps) => (
  <Tag
    preventShrink
    color={color}
    text={label}
    Icon={Icon}
    preventPadding={preventPadding}
    shouldKeepColor={shouldKeepColor}
  />
);
