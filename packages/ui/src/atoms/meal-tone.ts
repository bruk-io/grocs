import { tokens } from '../tokens/tokens.ts';

/** The five colours a meal can wear. The colour comes from the meal, never from status. */
export const MEAL_TONES = ['amber', 'sky', 'tomato', 'leaf', 'neutral'] as const;
export type MealTone = (typeof MEAL_TONES)[number];

export const mealColours: Record<MealTone, { fill: string; ink: string }> = {
  amber: { fill: tokens.color.mealAmber, ink: tokens.color.mealAmberInk },
  sky: { fill: tokens.color.mealSky, ink: tokens.color.mealSkyInk },
  tomato: { fill: tokens.color.mealTomato, ink: tokens.color.mealTomatoInk },
  leaf: { fill: tokens.color.mealLeaf, ink: tokens.color.mealLeafInk },
  neutral: { fill: tokens.color.tagNeutral, ink: tokens.color.tagNeutralInk },
};
