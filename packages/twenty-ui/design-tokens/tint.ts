import { token } from './token';

// Zone CRM: the one place a second colour is allowed.
//
// design-system/capital-works/MASTER.md, "Tints", decided by Marcus on
// 14 September 2026: a glyph that classifies what kind of thing something is
// may sit on a pastel disc of its own hue, the way Apple tints the icons in
// Settings. A tint is a pair, the disc and the glyph on it, and it is never
// text, never a button, never a status, never a border and never a whole row.
//
// Each disc is its hue at 12% over the surface in light and 22% in dark. The
// glyph inks clear 3.0 against their disc everywhere and clear 4.5 nowhere,
// which is exactly why a tint ink is never used for text.
//
// One kind, one hue, everywhere: a call is blue in the CRM, in the phone app
// and in a report. The grey kind is deliberately not here: it is the ordinary
// fill with the glyph in secondary ink.
export const TINT_TOKENS = {
  // calls, phone
  blue: token({ light: '#e0eefc', dark: '#193450' }),
  blueInk: token({ light: '#0071e3', dark: '#2997ff' }),
  // messages, chat
  green: token({ light: '#e7f8eb', dark: '#21452c' }),
  greenInk: token({ light: '#248a3d', dark: '#30d158' }),
  // tasks, reminders
  orange: token({ light: '#fff2e0', dark: '#4f3a1a' }),
  orangeInk: token({ light: '#b25000', dark: '#ff9f0a' }),
  // notes
  purple: token({ light: '#f5eafb', dark: '#412a4d' }),
  purpleInk: token({ light: '#8944ab', dark: '#bf5af2' }),
  // mail, calendar
  teal: token({ light: '#ebf8fe', dark: '#2d4550' }),
  tealInk: token({ light: '#0071a4', dark: '#64d2ff' }),
};
