import { View } from 'react-native';
import type { MealTone } from '../atoms/meal-tone.ts';
import type { IconName } from '../icons/index.ts';
import type { MascotName } from '../mascots/art/index.ts';
import { ActivityToast } from '../molecules/ActivityToast.tsx';
import type { ActivityToastProps } from '../molecules/ActivityToast.tsx';
import type { StackMember } from '../molecules/AvatarStack.tsx';
import { FilterEmpty } from '../molecules/FilterEmpty.tsx';
import { MealFilterLine } from '../molecules/MealFilterLine.tsx';
import { StatusBanner } from '../molecules/StatusBanner.tsx';
import type { StatusBannerProps } from '../molecules/StatusBanner.tsx';
import { CartSection } from '../organisms/CartSection.tsx';
import { CelebrationBanner } from '../organisms/CelebrationBanner.tsx';
import { EmptyList } from '../organisms/EmptyList.tsx';
import { ListSection } from '../organisms/ListSection.tsx';
import type { ListItem } from '../organisms/ListSection.tsx';
import { MainHeader } from '../organisms/MainHeader.tsx';
import { MealRail } from '../organisms/MealRail.tsx';
import type { MealRailProps } from '../organisms/MealRail.tsx';
import { NavTabs } from '../organisms/NavTabs.tsx';
import { InnerLayout } from './layouts/InnerLayout.tsx';
import { MainLayout } from './layouts/MainLayout.tsx';

/** The Groceries screen as it appears in the reference: the list (Main), offline with changes waiting (Offline), the partner's toast (Toast), nothing on the list (Empty) and everything in the cart (AllDone). */
export const GROCERYLISTTEMPLATE_STATES = ['groceries', 'offline', 'toast', 'empty', 'allDone'] as const;

/** One group of things still to buy, such as Produce. */
export interface GrocerySection {
  id: string;
  icon: IconName;
  title: string;
  items: readonly ListItem[];
}

/** The meal the list is narrowed to. The caller passes only that meal's sections. */
export interface GroceryFilter {
  mealName: string;
  /** Its items still to buy. */
  count: number;
  tone?: MealTone;
  onShowAll?: () => void;
}

export interface GroceryListTemplateProps {
  /** phone puts the tab bar under the list; inner (the Fold's inner screen) puts the meal rail on the left instead. */
  layout?: 'phone' | 'inner';
  /** The rail of the inner layout. The phone layout ignores it. */
  rail?: MealRailProps;
  /** Set while the list is narrowed to a meal: the filter line shows on top and an empty list says the meal has nothing. */
  filter?: GroceryFilter;
  /** The small line top left, such as "Week of Oct 19". */
  weekLabel: string;
  members: readonly StackMember[];
  onSettings?: () => void;
  /** Which mushroom sits beside the title (Ollie when offline, the enoki when done). */
  mascot: MascotName;
  /** Items still to buy and items in the cart, counted from the list. */
  toGo: number;
  inCart: number;
  /** The add field. */
  addValue: string;
  onAddValueChange: (text: string) => void;
  onAdd?: () => void;
  /** What the other person just did. */
  toast?: ActivityToastProps;
  /** Where the changes are: offline, syncing or sent. */
  banner?: StatusBannerProps;
  /** The things still to buy, by section. */
  sections: readonly GrocerySection[];
  /** The things in the cart. */
  cartItems: readonly ListItem[];
  onToggleItem?: (id: string, inCart: boolean) => void;
  onRemoveItem?: (id: string) => void;
  onClearCart?: () => void;
  /** Goes to the add-an-item screen, from the empty list. */
  onAddItem?: () => void;
  /** Goes to Meal plan. */
  onOpenPlan?: () => void;
}

/** template.main filled for Groceries: header.main, toast, status.banner, list.section x n, cart.section, celebration.banner or list.empty, nav.tabs. */
export function GroceryListTemplate({
  layout = 'phone',
  rail,
  filter,
  weekLabel,
  members,
  onSettings,
  mascot,
  toGo,
  inCart,
  addValue,
  onAddValueChange,
  onAdd,
  toast,
  banner,
  sections,
  cartItems,
  onToggleItem,
  onRemoveItem,
  onClearCart,
  onAddItem,
  onOpenPlan,
}: GroceryListTemplateProps) {
  const filtered = filter !== undefined;
  const nothingForMeal = filtered && sections.length === 0;
  const empty = !filtered && sections.length === 0 && cartItems.length === 0;
  const allDone = !filtered && sections.length === 0 && cartItems.length > 0;
  const header = (
        <MainHeader
          title="Groceries"
          eyebrow={weekLabel}
          members={members}
          mascot={mascot}
          progress={{ toGo, inCart }}
          addBar={{ value: addValue, onChangeText: onAddValueChange, ...(onAdd ? { onAdd, onSubmit: onAdd } : {}) }}
          {...(onSettings ? { onSettings } : {})}
        />
  );
  const body = (
    <>
      {banner ? <StatusBanner {...banner} /> : null}
      {toast ? (
        <View>
          <ActivityToast {...toast} />
        </View>
      ) : null}
      {filter ? <MealFilterLine mealName={filter.mealName} count={filter.count} {...(filter.tone ? { tone: filter.tone } : {})} {...(filter.onShowAll ? { onShowAll: filter.onShowAll } : {})} /> : null}
      {nothingForMeal ? <FilterEmpty mealName={filter.mealName} /> : null}
      {empty ? <EmptyList {...(onAddItem ? { onAction: onAddItem } : {})} /> : null}
      {allDone ? <CelebrationBanner /> : null}
      {sections.map((section) => (
        <ListSection
          key={section.id}
          icon={section.icon}
          title={section.title}
          items={section.items}
          {...(onToggleItem ? { onToggleItem } : {})}
          {...(onRemoveItem ? { onRemoveItem } : {})}
        />
      ))}
      {!filtered && cartItems.length > 0 ? <CartSection items={cartItems} {...(onToggleItem ? { onToggleItem } : {})} {...(onClearCart ? { onClear: onClearCart } : {})} /> : null}
    </>
  );
  if (layout === 'inner') {
    return (
      <InnerLayout rail={rail ? <MealRail {...rail} /> : null} header={header}>
        {body}
      </InnerLayout>
    );
  }
  return (
    <MainLayout
      header={header}
      nav={
        <NavTabs
          tabs={[
            { id: 'plan', label: 'Meal plan', icon: 'calendar' },
            { id: 'groceries', label: 'Groceries', icon: 'cart', ...(toGo > 0 ? { count: toGo } : {}) },
          ]}
          activeId="groceries"
          onSelect={(id) => {
            if (id === 'plan') onOpenPlan?.();
          }}
        />
      }
    >
      {body}
    </MainLayout>
  );
}
