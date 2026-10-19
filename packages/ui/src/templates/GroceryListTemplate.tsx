import { View } from 'react-native';
import type { IconName } from '../icons/index.ts';
import type { MascotName } from '../mascots/art/index.ts';
import { ActivityToast } from '../molecules/ActivityToast.tsx';
import type { ActivityToastProps } from '../molecules/ActivityToast.tsx';
import type { StackMember } from '../molecules/AvatarStack.tsx';
import { StatusBanner } from '../molecules/StatusBanner.tsx';
import type { StatusBannerProps } from '../molecules/StatusBanner.tsx';
import { CartSection } from '../organisms/CartSection.tsx';
import { CelebrationBanner } from '../organisms/CelebrationBanner.tsx';
import { EmptyList } from '../organisms/EmptyList.tsx';
import { ListSection } from '../organisms/ListSection.tsx';
import type { ListItem } from '../organisms/ListSection.tsx';
import { MainHeader } from '../organisms/MainHeader.tsx';
import { NavTabs } from '../organisms/NavTabs.tsx';
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

export interface GroceryListTemplateProps {
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
  const empty = sections.length === 0 && cartItems.length === 0;
  const allDone = sections.length === 0 && cartItems.length > 0;
  return (
    <MainLayout
      header={
        <MainHeader
          title="Groceries"
          eyebrow={weekLabel}
          members={members}
          mascot={mascot}
          progress={{ toGo, inCart }}
          addBar={{ value: addValue, onChangeText: onAddValueChange, ...(onAdd ? { onAdd, onSubmit: onAdd } : {}) }}
          {...(onSettings ? { onSettings } : {})}
        />
      }
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
      {banner ? <StatusBanner {...banner} /> : null}
      {toast ? (
        <View>
          <ActivityToast {...toast} />
        </View>
      ) : null}
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
      {cartItems.length > 0 ? <CartSection items={cartItems} {...(onToggleItem ? { onToggleItem } : {})} {...(onClearCart ? { onClear: onClearCart } : {})} /> : null}
    </MainLayout>
  );
}
