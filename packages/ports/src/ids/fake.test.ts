import { describe, expect, it } from 'vitest';
import { idsContract } from './contract.ts';
import { SequentialIds } from './fake.ts';

idsContract({ describe, it, expect }, () => new SequentialIds());
