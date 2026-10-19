import { LabelledField } from '../molecules/LabelledField.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { ActionBar } from './layouts/ActionBar.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Add a meal screen: filled in, and while the meal is being added. */
export const MEALFORMTEMPLATE_STATES = ['rest'] as const;

export interface MealFormTemplateProps {
  /** The day being planned as it should read, such as "Thursday, Oct 22". */
  dateLabel: string;
  /** What the action bar says, such as "Add to Thursday". */
  submitLabel: string;
  name: string;
  onNameChange: (name: string) => void;
  link: string;
  onLinkChange: (link: string) => void;
  /** Pastes the clipboard into the link field. */
  onPasteLink?: () => void;
  onSubmit?: () => void;
  /** The meal is being added. */
  adding?: boolean;
  /** Goes back to Meal plan. */
  onBack?: () => void;
}

/** template.task filled for Add a meal: header.sub, field.labelled x 2, action.bar. */
export function MealFormTemplate({ dateLabel, submitLabel, name, onNameChange, link, onLinkChange, onPasteLink, onSubmit, adding = false, onBack }: MealFormTemplateProps) {
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'back', label: 'Meal plan', ...(onBack ? { onPress: onBack } : {}) }} tag={dateLabel} title="Add a meal" mascot="chanty" />}
      actionBar={<ActionBar label={submitLabel} loading={adding} loadingLabel="Adding" {...(onSubmit ? { onPress: onSubmit } : {})} />}
    >
      <LabelledField label="What are you making?" value={name} onChangeText={onNameChange} disabled={adding} {...(onSubmit ? { onSubmit } : {})} />
      <LabelledField
        label="Recipe link"
        optional
        value={link}
        onChangeText={onLinkChange}
        placeholder="Paste a link"
        hint="Saved with the meal, so the recipe is easy to find again."
        actionLabel="Paste"
        disabled={adding}
        {...(onPasteLink ? { onAction: onPasteLink } : {})}
      />
    </TaskLayout>
  );
}
