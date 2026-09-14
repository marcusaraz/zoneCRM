import { type IconComponent } from '@ui/icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@ui/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { type ThemeColor } from '@ui/theme';
import { themeCssVariables, useTheme } from '@ui/theme-constants';
import { clsx } from 'clsx';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Tag.module.scss';

type TagWeight = 'regular' | 'medium';
type TagVariant = 'solid' | 'outline' | 'border';
export type TagColor = ThemeColor | 'transparent';

type TagProps = {
  className?: string;
  color: TagColor;
  text: string;
  Icon?: IconComponent;
  onClick?: () => void;
  weight?: TagWeight;
  variant?: TagVariant;
  preventShrink?: boolean;
  preventPadding?: boolean;
  shouldKeepColor?: boolean;
};

export const Tag = ({
  className,
  color,
  text,
  Icon,
  onClick,
  weight = 'regular',
  variant = 'solid',
  preventShrink,
  preventPadding,
  shouldKeepColor = false,
}: TagProps) => {
  const theme = useTheme();

  // Decision 14, Marcus on 14 September 2026, having seen the two side by
  // side: no colour per option, anywhere. Not on the record card, not in the
  // list, not on the board. A tag is a quiet pill, the fill behind it and the
  // reading ink on it, and the word is what carries the meaning.
  //
  // MASTER.md says the same thing in its own words: one blue, and anything
  // that has to stand out and is not the action gets weight or space, never a
  // second colour. The option colours are still stored and still shown in the
  // settings where somebody picks them; they simply do not reach the screen
  // somebody works on. The color prop is kept so that a caller that wants a
  // transparent tag can still ask for one.
  //
  // He revised it the same day with one exception: Owner. Who a record belongs
  // to is the one thing read by scanning a column rather than by reading it,
  // and a colour per person is what makes that possible. A caller asks for it
  // deliberately, so the exception is one word at the call site and cannot
  // spread by accident.
  const tagBackground =
    color === 'transparent'
      ? 'transparent'
      : shouldKeepColor
        ? (themeCssVariables.tag.background[color] ??
          themeCssVariables.tag.background.gray)
        : themeCssVariables.background.quaternary;

  const tagText =
    color === 'transparent'
      ? themeCssVariables.font.color.secondary
      : shouldKeepColor
        ? (themeCssVariables.tag.text[color] ??
          themeCssVariables.font.color.secondary)
        : themeCssVariables.font.color.primary;

  const isInteractive = isDefined(onClick);

  const tagContent = (
    <>
      {isDefined(Icon) ? (
        <div className={styles.iconContainer}>
          <Icon
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
            aria-hidden
          />
        </div>
      ) : (
        <></>
      )}
      {preventShrink ? (
        <span className={styles.nonShrinkableText}>{text}</span>
      ) : (
        <span className={styles.content}>
          <OverflowingTextWithTooltip text={text} />
        </span>
      )}
    </>
  );

  const sharedStyle = {
    '--tag-background': tagBackground,
    '--tag-text': tagText,
  } as React.CSSProperties;

  const sharedClassName = clsx(
    styles.tag,
    weight === 'medium' && styles.weightMedium,
    variant === 'outline' && styles.variantOutline,
    variant === 'border' && styles.variantBorder,
    preventShrink && styles.preventShrink,
    preventPadding && styles.preventPadding,
    className,
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className={clsx(sharedClassName, styles.interactive)}
        onClick={onClick}
        style={sharedStyle}
      >
        {tagContent}
      </button>
    );
  }

  return (
    <span className={sharedClassName} style={sharedStyle}>
      {tagContent}
    </span>
  );
};
