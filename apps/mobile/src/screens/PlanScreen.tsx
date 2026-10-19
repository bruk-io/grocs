import { MealPlanTemplate } from '@grocs/ui';
import { household, week } from '../sample/sample-data.ts';
import { useGo } from './navigate.ts';

/** The week's meals, with sample data. The Groceries tab, settings and Plan a meal lead where the design shows. */
export function PlanScreen() {
  const go = useGo();
  return <MealPlanTemplate weekLabel="Oct 19 - 25" members={household} days={week} toBuy={14} onSettings={go.settings} onPlan={go.addMeal} onOpenGroceries={go.groceries} />;
}
