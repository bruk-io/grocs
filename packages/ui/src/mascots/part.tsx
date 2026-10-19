import { createContext, useContext } from 'react';
import type { ComponentType, ReactElement } from 'react';

/** Extra props for named parts of one piece of art, such as the animation of `eyeL`. */
export type PartProps = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

/** The Mascot component provides these; without a provider the art is drawn still. */
export const PartPropsContext = createContext<PartProps>({});

/**
 * One named, movable element of generated art (decision-5, decision-10). The art draws `<Part name="eyeL"
 * as={Ellipse} ... />`; whoever animates it supplies props by that name through PartPropsContext.
 */
export function Part<P extends object>({ name, as: Component, ...rest }: { name: string; as: ComponentType<P> } & P): ReactElement {
  const extra = useContext(PartPropsContext)[name];
  return <Component {...(rest as unknown as P)} {...(extra as Partial<P> | undefined)} />;
}
