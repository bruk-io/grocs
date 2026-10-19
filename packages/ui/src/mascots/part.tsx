import { createContext, useContext } from 'react';
import type { ComponentType, ReactElement } from 'react';
import Animated from 'react-native-reanimated';

/** Extra props for named parts of one piece of art, such as the animation of `eyeL`. */
export type PartProps = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

/** The Mascot component provides these; without a provider the art is drawn still. */
export const PartPropsContext = createContext<PartProps>({});

// One animated wrapper per component type, made once: wrapping on every render would remount the part.
const animatedOf = new WeakMap<object, ComponentType<never>>();
function animated<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  let wrapped = animatedOf.get(Component);
  if (wrapped === undefined) {
    wrapped = Animated.createAnimatedComponent(Component as ComponentType<object>) as unknown as ComponentType<never>;
    animatedOf.set(Component, wrapped);
  }
  return wrapped as unknown as ComponentType<P>;
}

/**
 * One named, movable element of generated art (decision-5, decision-10). The art draws `<Part name="eyeL"
 * as={Ellipse} ... />`; whoever animates it supplies props by that name through PartPropsContext. A part
 * given a `style` (the CSS animation) is drawn as a Reanimated component; the others stay plain.
 */
export function Part<P extends object>({ name, as: Component, ...rest }: { name: string; as: ComponentType<P> } & P): ReactElement {
  const extra = useContext(PartPropsContext)[name];
  const Drawn = extra !== undefined && 'style' in extra ? animated(Component) : Component;
  return <Drawn {...(rest as unknown as P)} {...(extra as Partial<P> | undefined)} />;
}
