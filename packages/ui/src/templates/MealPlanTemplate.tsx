import type { StackMember } from '../molecules/AvatarStack.tsx';
import { MainHeader } from '../organisms/MainHeader.tsx';
import { NavTabs } from '../organisms/NavTabs.tsx';
import { WeekList } from '../organisms/WeekList.tsx';
import type { PlanDay } from '../organisms/WeekList.tsx';
import { MainLayout } from './layouts/MainLayout.tsx';

/** The Meal plan screen: a week with meals, and a week with nothing planned. */
export const MEALPLANTEMPLATE_STATES = ['week'] as const;

export interface MealPlanTemplateProps {
  /** Shown above the week nav, such as 'This week' or 'That week'. */
  title: string;
  /** The week as it should read, such as "Oct 19 - 25". */
  weekLabel: string;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  members: readonly StackMember[];
  onSettings?: () => void;
  days: readonly PlanDay[];
  onOpenMeal?: (dayId: string, mealId: string) => void;
  /** Opens add-a-meal for that day. */
  onPlan?: (dayId: string) => void;
  /** What is still to buy; the number on the Groceries tab. */
  toBuy: number;
  /** Goes to Groceries. */
  onOpenGroceries?: () => void;
}

/** template.main filled for Meal plan: header.main (week.nav), week.list, nav.tabs. */
export function MealPlanTemplate({ title, weekLabel, onPreviousWeek, onNextWeek, members, onSettings, days, onOpenMeal, onPlan, toBuy, onOpenGroceries }: MealPlanTemplateProps) {
  return (
    <MainLayout
      header={
        <MainHeader
          title={title}
          weekNav={{ label: weekLabel, ...(onPreviousWeek ? { onPrevious: onPreviousWeek } : {}), ...(onNextWeek ? { onNext: onNextWeek } : {}) }}
          members={members}
          mascot="shii"
          {...(onSettings ? { onSettings } : {})}
        />
      }
      nav={
        <NavTabs
          tabs={[
            { id: 'plan', label: 'Meal plan', icon: 'calendar' },
            { id: 'groceries', label: 'Groceries', icon: 'cart', ...(toBuy > 0 ? { count: toBuy } : {}) },
          ]}
          activeId="plan"
          onSelect={(id) => {
            if (id === 'groceries') onOpenGroceries?.();
          }}
        />
      }
    >
      <WeekList days={days} {...(onOpenMeal ? { onOpenMeal } : {})} {...(onPlan ? { onPlan } : {})} />
    </MainLayout>
  );
}
