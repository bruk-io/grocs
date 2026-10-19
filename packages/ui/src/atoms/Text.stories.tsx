import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from './Text.tsx';

const meta = { title: 'Atoms/Text', component: Text, args: { children: 'Oat milk' } } satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Fredoka 700, 60. */
export const Display: Story = { args: { variant: 'display', children: 'Grocs' } };
/** Fredoka 700, 38. */
export const TitleL: Story = { args: { variant: 'titleL', children: 'Groceries' } };
/** Fredoka 700, 32. */
export const TitleM: Story = { args: { variant: 'titleM', children: 'Add a meal' } };
/** Fredoka 600, 18. */
export const Heading: Story = { args: { variant: 'heading', children: 'Invite your partner' } };
/** Nunito 800, 16. */
export const Label: Story = { args: { variant: 'label', children: 'Yellow onions' } };
/** Nunito 600, 15. */
export const Body: Story = { args: { variant: 'body', children: 'Paste a few items at once' } };
/** Nunito 600, 13. */
export const Small: Story = { args: { variant: 'small', children: 'Dairy & eggs · usually 1 dozen' } };
/** Nunito 800, 12. */
export const Caption: Story = { args: { variant: 'caption', children: 'INVITE CODE' } };
/** Nunito 800, 11. */
export const Micro: Story = { args: { variant: 'micro', children: 'CHANA MASALA' } };
export const Title: Story = { args: { variant: 'title', children: 'This week' } };
export const Muted: Story = { args: { variant: 'muted', children: '2 cartons' } };
export const Struck: Story = { args: { variant: 'struck' } };
