// GENERATED from design/svg/mascots/*.svg by tools/build-svg.ts (R62). Do not edit the file: add or edit an SVG, then run: pnpm svg
import { ChantyArt } from './Chanty.tsx';
import { CremiArt } from './Cremi.tsx';
import { EnokiArt } from './Enoki.tsx';
import { MortyArt } from './Morty.tsx';
import { OllieArt } from './Ollie.tsx';
import { ShiiArt } from './Shii.tsx';

/** Each mushroom's art. The Mascot component animates its named parts (decision-5). */
export const mascotArt = {
  chanty: ChantyArt,
  cremi: CremiArt,
  enoki: EnokiArt,
  morty: MortyArt,
  ollie: OllieArt,
  shii: ShiiArt,
} as const;

export type MascotName = keyof typeof mascotArt;
