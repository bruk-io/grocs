// A clipboard that records what was copied, for tests of anything that calls `App.copyText`.
// An app seam (compose-app.ts), not a port, so it lives here and not in @grocs/ports/testing.
export class FakeClipboard {
  readonly copied: string[] = [];

  /** The most recent text copied, or null when nothing has been. */
  get text(): string | null {
    return this.copied.at(-1) ?? null;
  }

  readonly copyText = (text: string): Promise<void> => {
    this.copied.push(text);
    return Promise.resolve();
  };
}
