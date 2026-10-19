import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button } from './Button.tsx';

const meta = { title: 'Atoms/Button', component: Button, args: { label: 'Add to list', loadingLabel: 'Adding' } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

// The five declared states, on button.primary at its action-bar size.
export const Rest: Story = {};
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };

// The other variants, each in the same five states.
const primarySmall = { variant: 'primary', size: 's', label: 'Add', loadingLabel: 'Adding' } as const;
export const PrimarySmallRest: Story = { args: primarySmall };
export const PrimarySmallPressed: Story = { args: { ...primarySmall, forceState: 'pressed' } };
export const PrimarySmallFocus: Story = { args: { ...primarySmall, forceState: 'focus' } };
export const PrimarySmallDisabled: Story = { args: { ...primarySmall, disabled: true } };
export const PrimarySmallLoading: Story = { args: { ...primarySmall, loading: true } };

const secondary = { variant: 'secondary', label: 'Continue with Google', loadingLabel: 'Signing in' } as const;
export const SecondaryRest: Story = { args: secondary };
export const SecondaryPressed: Story = { args: { ...secondary, forceState: 'pressed' } };
export const SecondaryFocus: Story = { args: { ...secondary, forceState: 'focus' } };
export const SecondaryDisabled: Story = { args: { ...secondary, disabled: true } };
export const SecondaryLoading: Story = { args: { ...secondary, loading: true } };

const secondarySmall = { variant: 'secondary', size: 's', label: 'Copy code', loadingLabel: 'Copying' } as const;
export const SecondarySmallRest: Story = { args: secondarySmall };
export const SecondarySmallPressed: Story = { args: { ...secondarySmall, forceState: 'pressed' } };
export const SecondarySmallFocus: Story = { args: { ...secondarySmall, forceState: 'focus' } };
export const SecondarySmallDisabled: Story = { args: { ...secondarySmall, disabled: true } };
export const SecondarySmallLoading: Story = { args: { ...secondarySmall, loading: true } };

const soft = { variant: 'soft', label: 'Paste', loadingLabel: 'Pasting' } as const;
export const SoftRest: Story = { args: soft };
export const SoftPressed: Story = { args: { ...soft, forceState: 'pressed' } };
export const SoftFocus: Story = { args: { ...soft, forceState: 'focus' } };
export const SoftDisabled: Story = { args: { ...soft, disabled: true } };
export const SoftLoading: Story = { args: { ...soft, loading: true } };

const text = { variant: 'text', label: 'Try again', loadingLabel: 'Trying' } as const;
export const TextRest: Story = { args: text };
export const TextPressed: Story = { args: { ...text, forceState: 'pressed' } };
export const TextFocus: Story = { args: { ...text, forceState: 'focus' } };
export const TextDisabled: Story = { args: { ...text, disabled: true } };
export const TextLoading: Story = { args: { ...text, loading: true } };

const back = { variant: 'back', label: 'Meal plan', loadingLabel: 'Going' } as const;
export const BackRest: Story = { args: back };
export const BackPressed: Story = { args: { ...back, forceState: 'pressed' } };
export const BackFocus: Story = { args: { ...back, forceState: 'focus' } };
export const BackDisabled: Story = { args: { ...back, disabled: true } };
export const BackLoading: Story = { args: { ...back, loading: true } };

const icon = { variant: 'icon', label: 'Add item', icon: 'add' } as const;
export const IconRest: Story = { args: icon };
export const IconPressed: Story = { args: { ...icon, forceState: 'pressed' } };
export const IconFocus: Story = { args: { ...icon, forceState: 'focus' } };
export const IconDisabled: Story = { args: { ...icon, disabled: true } };
export const IconLoading: Story = { args: { ...icon, loading: true } };

const iconSoft = { variant: 'iconSoft', label: 'Add item', icon: 'add' } as const;
export const IconSoftRest: Story = { args: iconSoft };
export const IconSoftPressed: Story = { args: { ...iconSoft, forceState: 'pressed' } };
export const IconSoftFocus: Story = { args: { ...iconSoft, forceState: 'focus' } };
export const IconSoftDisabled: Story = { args: { ...iconSoft, disabled: true } };
export const IconSoftLoading: Story = { args: { ...iconSoft, loading: true } };

const iconGhost = { variant: 'iconGhost', label: 'Add item', icon: 'add' } as const;
export const IconGhostRest: Story = { args: iconGhost };
export const IconGhostPressed: Story = { args: { ...iconGhost, forceState: 'pressed' } };
export const IconGhostFocus: Story = { args: { ...iconGhost, forceState: 'focus' } };
export const IconGhostDisabled: Story = { args: { ...iconGhost, disabled: true } };
export const IconGhostLoading: Story = { args: { ...iconGhost, loading: true } };
