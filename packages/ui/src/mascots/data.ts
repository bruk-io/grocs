import type { MascotName } from './art/index.ts';
import { chanty } from './chanty.ts';
import { cremi } from './cremi.ts';
import { enoki } from './enoki.ts';
import { morty } from './morty.ts';
import { ollie } from './ollie.ts';
import { shii } from './shii.ts';
import type { MascotData } from './types.ts';

/** Every mushroom's data (R62), keyed by name. */
export const mascots: Readonly<Record<MascotName, MascotData>> = { cremi, shii, chanty, ollie, morty, enoki };
