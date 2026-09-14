import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { getTitleFromActivityBody } from '@/activities/utils/getTitleFromActivityBody';
import { useRefreshShowPageFindManyActivitiesQueries } from '@/activities/hooks/useRefreshShowPageFindManyActivitiesQueries';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { objectShowPageTargetableObjectState } from '@/activities/timeline-activities/states/objectShowPageTargetableObjectState';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isDefined } from 'twenty-shared/utils';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useUpsertActivity = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
}) => {
  const [isActivityInCreateMode] = useAtomState(isActivityInCreateModeState);

  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord();

  const { createActivityInDB } = useCreateActivityInDB({
    activityObjectNameSingular,
  });

  const [, setIsUpsertingActivityInDB] = useAtomState(
    isUpsertingActivityInDBState,
  );

  const objectShowPageTargetableObject = useAtomStateValue(
    objectShowPageTargetableObjectState,
  );

  const { refreshShowPageFindManyActivitiesQueries } =
    useRefreshShowPageFindManyActivitiesQueries({
      activityObjectNameSingular,
    });

  const upsertActivity = async ({
    activity,
    input,
  }: {
    activity: Task | Note;
    input: Partial<Task | Note>;
  }) => {
    // Zone CRM: name it after its first line when nobody named it. Every save
    // goes through here, so this is the one place that has both the body and
    // the title in hand. A title somebody typed is never touched.
    const titleAfterInput = (
      'title' in input ? (input.title ?? '') : (activity.title ?? '')
    ).trim();
    const bodyAfterInput = 'bodyV2' in input ? input.bodyV2 : activity.bodyV2;
    const derivedTitle =
      titleAfterInput === ''
        ? getTitleFromActivityBody(
            bodyAfterInput?.blocknote,
            bodyAfterInput?.markdown,
          )
        : '';
    const inputWithTitle: Partial<Task | Note> =
      derivedTitle === '' ? input : { ...input, title: derivedTitle };

    setIsUpsertingActivityInDB(true);
    if (isActivityInCreateMode) {
      const activityToCreate: Partial<Task | Note> = {
        ...activity,
        ...inputWithTitle,
      };

      if (isDefined(objectShowPageTargetableObject)) {
        refreshShowPageFindManyActivitiesQueries();
      }

      await createActivityInDB(activityToCreate);
    } else {
      await updateOneActivity?.({
        objectNameSingular: activityObjectNameSingular,
        idToUpdate: activity.id,
        updateOneRecordInput: inputWithTitle,
      });
    }

    setIsUpsertingActivityInDB(false);
  };

  return {
    upsertActivity,
  };
};
