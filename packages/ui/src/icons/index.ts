// GENERATED from design/svg/icons/*.svg by tools/build-svg.ts (R62). Do not edit the file: add or edit an SVG, then run: pnpm svg
import { Add } from './generated/Add.tsx';
import { Alert } from './generated/Alert.tsx';
import { Back } from './generated/Back.tsx';
import { Bakery } from './generated/Bakery.tsx';
import { Calendar } from './generated/Calendar.tsx';
import { Cart } from './generated/Cart.tsx';
import { Check } from './generated/Check.tsx';
import { Clock } from './generated/Clock.tsx';
import { Close } from './generated/Close.tsx';
import { CloudOff } from './generated/CloudOff.tsx';
import { Copy } from './generated/Copy.tsx';
import { Dairy } from './generated/Dairy.tsx';
import { Forward } from './generated/Forward.tsx';
import { Link } from './generated/Link.tsx';
import { Meat } from './generated/Meat.tsx';
import { Pantry } from './generated/Pantry.tsx';
import { Produce } from './generated/Produce.tsx';
import { Remove } from './generated/Remove.tsx';
import { Settings } from './generated/Settings.tsx';
import { Share } from './generated/Share.tsx';
import { Undo } from './generated/Undo.tsx';

/** The named icon set. Every icon is drawn with the stroke width from tokens.stroke.icon. */
export const icons = {
  add: Add,
  alert: Alert,
  back: Back,
  bakery: Bakery,
  calendar: Calendar,
  cart: Cart,
  check: Check,
  clock: Clock,
  close: Close,
  'cloud-off': CloudOff,
  copy: Copy,
  dairy: Dairy,
  forward: Forward,
  link: Link,
  meat: Meat,
  pantry: Pantry,
  produce: Produce,
  remove: Remove,
  settings: Settings,
  share: Share,
  undo: Undo,
} as const;

export type IconName = keyof typeof icons;
