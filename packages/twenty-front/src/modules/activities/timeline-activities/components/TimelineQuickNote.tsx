import { styled } from '@linaria/react';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectMorphJunctionConfigOrThrow } from '@/object-record/hooks/useObjectMorphJunctionConfigOrThrow';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getTitleFromActivityBody } from '@/activities/utils/getTitleFromActivityBody';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

// A note is written where it will be read.
//
// The Stitch person record puts a "Write a note..." field at the top of the
// timeline card, and Marcus asked for what HubSpot does: no window, no panel,
// the note goes in above the entries it will join. Typing shows a Save pill;
// Enter saves, Shift+Enter makes a new line, Escape clears. The note's name is
// its first line, by the fork's own rule, so nobody is asked for a title.
//
// This is the create path of Twenty's own drawer with the drawer taken off the
// end: one note record, one link row to the record this timeline is about.
// The paper clip the drawing shows is not here yet: a clip that did nothing
// would be a lie, and attaching a file from this field is its own piece of
// work.

const StyledField = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
  min-height: 44px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  width: 100%;

  &:focus-within {
    border-color: ${themeCssVariables.border.color.blue};
  }
`;

const StyledInput = styled.textarea`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1 1 auto;
  font-family: inherit;
  font-size: 1.15rem;
  line-height: 1.5;
  min-width: 0;
  outline: none;
  padding: 0;
  resize: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

// A pill, MASTER.md: every button. The one blue, on the one action, and only
// once there is something to save.
const StyledSave = styled.button`
  align-self: flex-end;
  background: ${themeCssVariables.color.blue};
  border: none;
  border-radius: 999px;
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 28px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

type TimelineQuickNoteProps = {
  targetableObject: ActivityTargetableObject;
};

export const TimelineQuickNote = ({
  targetableObject,
}: TimelineQuickNoteProps) => {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { objectMetadataItems } = useObjectMetadataItems();

  const { createOneRecord: createNote } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
    shouldMatchRootQueryFilter: true,
  });

  const morphJunctionConfig = useObjectMorphJunctionConfigOrThrow({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const { createManyRecords: createNoteTargets } = useCreateManyRecords({
    objectNameSingular: morphJunctionConfig.junctionObjectMetadata.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const save = async () => {
    const markdown = text.trim();

    if (markdown === '' || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const note = await createNote({
        title: getTitleFromActivityBody(null, markdown),
        bodyV2: { markdown, blocknote: null },
        position: 'last',
      });

      const { junctionObjectMetadata, sourceJoinColumnName } =
        morphJunctionConfig;
      const targetObjectMetadata = objectMetadataItems.find(
        (item) =>
          item.nameSingular === targetableObject.targetObjectNameSingular,
      );
      const targetFieldInfo = findTargetFieldInfo(
        junctionObjectMetadata.fields,
        targetObjectMetadata?.id ?? '',
        objectMetadataItems,
      );

      if (isDefined(targetFieldInfo?.joinColumnName)) {
        await createNoteTargets({
          recordsToCreate: [
            {
              [sourceJoinColumnName]: note.id,
              [targetFieldInfo.joinColumnName]: targetableObject.id,
            },
          ],
          upsert: true,
        });
      }

      setText('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StyledField>
      <StyledInput
        rows={1}
        placeholder="Write a note..."
        value={text}
        disabled={isSaving}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            save();
          }

          if (event.key === 'Escape') {
            setText('');
          }
        }}
      />
      {text.trim() !== '' && (
        <StyledSave type="button" disabled={isSaving} onClick={save}>
          {isSaving ? 'Saving' : 'Save'}
        </StyledSave>
      )}
    </StyledField>
  );
};
