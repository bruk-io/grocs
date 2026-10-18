// The six layers agents are generated for (decision-3), reusing the layer table the
// import-layers check already owns so there is one definition of "which packages are
// in which layer", not two that can drift apart.
import { PACKAGE_LAYER, unitOf, type Layer, type Unit } from '../checks/import-layers.ts';

export type { Layer, Unit };
export { unitOf };

export const LAYERS: readonly Layer[] = ['core', 'ports', 'application', 'providers', 'ui', 'app'];

/** Layer -> the package folders under packages/ it owns ('app' owns apps/* instead). */
export const LAYER_PACKAGES: Readonly<Record<Layer, readonly string[]>> = LAYERS.reduce(
  (out, layer) => ({ ...out, [layer]: Object.keys(PACKAGE_LAYER).filter((pkg) => PACKAGE_LAYER[pkg] === layer) }),
  {} as Record<Layer, readonly string[]>,
);

/** The layer that owns a repo-relative file path, or null when it is outside packages/ and apps/. */
export function layerOf(file: string): Layer | null {
  const unit: Unit | null = unitOf(file);
  return unit ? unit.layer : null;
}
