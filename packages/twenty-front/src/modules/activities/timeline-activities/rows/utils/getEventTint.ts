import { themeCssVariables } from 'twenty-ui/theme-constants';

// Zone CRM: one kind, one hue.
//
// MASTER.md "Tints", decided by Marcus on 14 September 2026: the glyph that
// says what kind of event this is sits on a pastel disc of its own hue. Calls
// are blue, messages green, tasks orange, notes purple, mail and calendar teal,
// and anything that is none of those is the ordinary fill with a secondary
// glyph, because a hue nobody chose is worse than no hue.
//
// The mapping is by the object the event is about rather than by its icon: an
// icon can be changed in Settings by anyone, and a call has to stay blue.

export type EventTint = { disc: string; glyph: string };

const GREY: EventTint = {
  disc: themeCssVariables.background.tertiary,
  glyph: themeCssVariables.font.color.tertiary,
};

const BY_OBJECT: Record<string, EventTint> = {
  phoneCall: {
    disc: themeCssVariables.tint.blue,
    glyph: themeCssVariables.tint.blueInk,
  },
  message: {
    disc: themeCssVariables.tint.green,
    glyph: themeCssVariables.tint.greenInk,
  },
  messageThread: {
    disc: themeCssVariables.tint.green,
    glyph: themeCssVariables.tint.greenInk,
  },
  task: {
    disc: themeCssVariables.tint.orange,
    glyph: themeCssVariables.tint.orangeInk,
  },
  taskTarget: {
    disc: themeCssVariables.tint.orange,
    glyph: themeCssVariables.tint.orangeInk,
  },
  note: {
    disc: themeCssVariables.tint.purple,
    glyph: themeCssVariables.tint.purpleInk,
  },
  noteTarget: {
    disc: themeCssVariables.tint.purple,
    glyph: themeCssVariables.tint.purpleInk,
  },
  calendarEvent: {
    disc: themeCssVariables.tint.teal,
    glyph: themeCssVariables.tint.tealInk,
  },
  calendarEventParticipant: {
    disc: themeCssVariables.tint.teal,
    glyph: themeCssVariables.tint.tealInk,
  },
};

export const getEventTint = (
  objectNameSingular: string | null | undefined,
): EventTint =>
  (objectNameSingular !== null && objectNameSingular !== undefined
    ? BY_OBJECT[objectNameSingular]
    : undefined) ?? GREY;
