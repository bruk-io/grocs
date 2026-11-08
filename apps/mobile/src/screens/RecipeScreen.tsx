import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RecipeTemplate, SubHeader, Text, tokens } from '@grocs/ui';
import { recipeForLink } from '@grocs/core';
import type { Meal, Recipe } from '@grocs/core';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { dayFor } from './week-days.ts';

export interface RecipeScreenProps {
  app: App;
  kitchenId: string;
  /** The day the meal is planned on (every entry point knows its day, same as AddMealScreen). */
  dayId: string;
  mealId: string;
}

/** The hostname RecipeTemplate shows under the title, e.g. "example.com" from "https://example.com/a". */
function hostnameFor(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return sourceUrl;
  }
}

/** A meal's saved recipe (decision-16): found through watchKitchenRecipes and recipeForLink, never by
 * calling the server or a recipe site (TASK-74.5 AC#4) - ImportRecipe is never dispatched here. */
export function RecipeScreen({ app, kitchenId, dayId, mealId }: RecipeScreenProps) {
  const go = useGo();
  const parsed = dayFor(dayId);
  const weekId = parsed?.weekId ?? '';
  const [meals, setMeals] = useState<readonly Meal[]>([]);
  const [recipes, setRecipes] = useState<readonly Recipe[]>([]);
  const [mealsLoaded, setMealsLoaded] = useState(false);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(
    () =>
      app.watchWeekMeals(
        kitchenId,
        weekId,
        (next) => {
          setMeals(next);
          setMealsLoaded(true);
        },
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId, weekId],
  );
  useEffect(
    () =>
      app.watchKitchenRecipes(
        kitchenId,
        (next) => {
          setRecipes(next);
          setRecipesLoaded(true);
        },
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId],
  );

  if (!parsed) return null;

  const meal = meals.find((m) => m.id === mealId);
  const recipe = recipeForLink(recipes, meal?.link.value ?? null);

  if (!recipe) {
    if (!loadError && (!mealsLoaded || !recipesLoaded)) return null;
    return (
      <View style={styles.screen}>
        <SubHeader lead={{ kind: 'back', label: 'Meal plan', onPress: go.plan }} title="Recipe" mascot="chanty" />
        <Text variant="body" tone="muted">
          {loadError ? `Could not load this recipe: ${loadError}` : 'No recipe is saved for this meal yet.'}
        </Text>
      </View>
    );
  }

  return (
    <RecipeTemplate
      title={recipe.title}
      yieldLabel={recipe.yield}
      sourceLabel={hostnameFor(recipe.sourceUrl)}
      ingredients={recipe.ingredients.map((ingredient) => ingredient.line)}
      steps={recipe.steps}
      onBack={go.plan}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: tokens.space[14], padding: tokens.space[14] },
});
