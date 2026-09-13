import { COLOR_TOKENS } from './color';
import { GRAY_SCALE_TOKENS } from './grayScale';
import { token } from './token';

const SM_RADIUS = token('4px');
const MD_RADIUS = token('8px');

export const BORDER_TOKENS = {
  color: {
    // A hairline or a change of ground, never a box. MASTER.md carries two of
    // these and not three, so the softer two both take the soft separator
    // rather than inventing a grey nobody chose.
    strong: token({ light: '#d2d2d7', dark: '#424245' }),
    medium: token({ light: '#e8e8ed', dark: '#333336' }),
    light: token({ light: '#e8e8ed', dark: '#333336' }),
    secondaryInverted: GRAY_SCALE_TOKENS.gray11,
    inverted: GRAY_SCALE_TOKENS.gray12,
    danger: COLOR_TOKENS.red5,
    blue: COLOR_TOKENS.blue7,
    transparentStrong: COLOR_TOKENS.transparent.gray4,
  },
  radius: {
    xs: token('2px'),
    sm: SM_RADIUS,
    md: MD_RADIUS,
    smRound: SM_RADIUS,
    mdRound: MD_RADIUS,
    lg: token('16px'),
    xl: token('20px'),
    xxl: token('40px'),
    pill: token('999px'),
    rounded: token('100%'),
  },
};
