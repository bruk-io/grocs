import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { LabelledField } from '../molecules/LabelledField.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { ActionBar } from './layouts/ActionBar.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** Add or edit a meal screen: fills in meal details, handles adding/editing/removing, and shows validation errors. */
export const MEALFORMTEMPLATE_STATES = ['rest', 'editing', 'removing', 'invalid', 'importing', 'importError', 'withRecipe'] as const;

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
  /** Shows the 'Get recipe and groceries' action under the link field when set. */
  onImportRecipe?: () => void;
  /** The import action shows busy and is disabled while true. */
  importing?: boolean;
  /** Shown under the link field, in place of linkError, when the import failed. */
  importError?: string;
  /** The title of the meal's saved recipe, shown with a 'View recipe' action. */
  recipeTitle?: string;
  /** Opens the meal's saved recipe. Shown, with recipeTitle, only when both are set. */
  onOpenRecipe?: () => void;
}

/** template.task: header.sub, field.labelled x 2, import action, remove button, action.bar. */
export function MealFormTemplate({
  dateLabel,
  title,
  submitLabel,
  submittingLabel,
  name,
  onNameChange,
  link,
  onLinkChange,
  onPasteLink,
  onSubmit,
  adding = false,
  onRemove,
  removing = false,
  linkError,
  onBack,
  onImportRecipe,
  importing = false,
  importError,
  recipeTitle,
  onOpenRecipe,
}: MealFormTemplateProps) {
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
        {...(importError ?? linkError ? { errorMessage: importError ?? linkError } : {})}
      />
      {onImportRecipe ? (
        <Button
          variant="secondary"
          stretch
          label="Get recipe and groceries"
          loading={importing}
          loadingLabel="Getting recipe"
          disabled={adding || removing}
          onPress={onImportRecipe}
        />
      ) : null}
      {recipeTitle && onOpenRecipe ? (
        <View style={styles.recipeRow}>
          <Text variant="small" tone="muted">
            Saved recipe: {recipeTitle}
          </Text>
          <Button variant="text" size="s" label="View recipe" disabled={adding || removing} onPress={onOpenRecipe} />
        </View>
      ) : null}
      {onRemove ? <Button variant="secondary" stretch label="Remove meal" loading={removing} loadingLabel="Removing" onPress={onRemove} disabled={adding} /> : null}
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  recipeRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[8] },
});
