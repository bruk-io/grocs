import { Button } from '../atoms/Button.tsx';
import { LabelledField } from '../molecules/LabelledField.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { ActionBar } from './layouts/ActionBar.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** Add or edit a meal screen: fills in meal details, handles adding/editing/removing, and shows validation errors. */
export const MEALFORMTEMPLATE_STATES = ['rest', 'editing', 'removing', 'invalid'] as const;

export interface MealFormTemplateProps {
  /** The day being planned as it should read, such as "Thursday, Oct 22". */
  dateLabel: string;
  /** The title shown in the header, such as "Add a meal" or "Edit a meal". */
  title: string;
  /** What the action bar says, such as "Add to Thursday". */
  submitLabel: string;
  /** The loading label shown on the action bar while submitting, such as "Adding" or "Saving". */
  submittingLabel: string;
  name: string;
  onNameChange: (name: string) => void;
  link: string;
  onLinkChange: (link: string) => void;
  /** Pastes the clipboard into the link field. */
  onPasteLink?: () => void;
  onSubmit?: () => void;
  /** The meal is being added. */
  adding?: boolean;
  /** Removes this meal. Shown only when editing an existing one. */
  onRemove?: () => void;
  /** The meal is being removed. */
  removing?: boolean;
  /** Shown under the link field when it fails R6 validation. */
  linkError?: string;
  /** Goes back to Meal plan. */
  onBack?: () => void;
}

/** template.task: header.sub, field.labelled x 2, remove button, action.bar. */
export function MealFormTemplate({ dateLabel, title, submitLabel, submittingLabel, name, onNameChange, link, onLinkChange, onPasteLink, onSubmit, adding = false, onRemove, removing = false, linkError, onBack }: MealFormTemplateProps) {
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'back', label: 'Meal plan', ...(onBack ? { onPress: onBack } : {}) }} tag={dateLabel} title={title} mascot="chanty" />}
      actionBar={<ActionBar label={submitLabel} loading={adding} loadingLabel={submittingLabel} disabled={adding || removing} {...(onSubmit ? { onPress: onSubmit } : {})} />}
    >
      <LabelledField label="What are you making?" value={name} onChangeText={onNameChange} disabled={adding || removing} {...(onSubmit ? { onSubmit } : {})} />
      <LabelledField
        label="Recipe link"
        optional
        value={link}
        onChangeText={onLinkChange}
        placeholder="Paste a link"
        hint="Saved with the meal, so the recipe is easy to find again."
        actionLabel="Paste"
        disabled={adding || removing}
        {...(onPasteLink ? { onAction: onPasteLink } : {})}
        {...(linkError ? { errorMessage: linkError } : {})}
      />
      {onRemove ? <Button variant="secondary" stretch label="Remove meal" loading={removing} loadingLabel="Removing" onPress={onRemove} disabled={adding} /> : null}
    </TaskLayout>
  );
}
