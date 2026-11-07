import type { ParsedRecipe, RecipeImportError, Result } from '@grocs/core';
import type { RecipeImporter } from '@grocs/ports';
import type { FunctionsFns } from './sdk.ts';

/**
 * Calls the importRecipe Cloud Function (decision-15). It does not fetch or parse anything
 * itself - that is the server's job - it only translates the port call onto the callable,
 * mirroring FirebaseKitchenGateway's callable client.
 */
export class FirebaseRecipeImporter implements RecipeImporter {
  readonly #fns: FunctionsFns;
  readonly #functionsInstance: unknown;

  constructor(fns: FunctionsFns, functionsInstance: unknown) {
    this.#fns = fns;
    this.#functionsInstance = functionsInstance;
  }

  async importRecipe(url: string): Promise<Result<ParsedRecipe, RecipeImportError>> {
    const call = this.#fns.httpsCallable<{ url: string }, Result<ParsedRecipe, RecipeImportError>>(this.#functionsInstance, 'importRecipe');
    const { data } = await call({ url });
    return data;
  }
}
