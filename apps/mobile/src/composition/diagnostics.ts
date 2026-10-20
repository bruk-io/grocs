// The text the diagnostics action copies (R35, decision-8): a header line with the app version, platform and
// build number, then the buffered log records as JSON lines. The records are already redacted (R36).
export interface BuildInfo {
  readonly appVersion: string;
  readonly platform: string;
  readonly build: string;
}

export function diagnosticsText(info: BuildInfo, records: string): string {
  const header = `grocs diagnostics - version ${info.appVersion}, platform ${info.platform}, build ${info.build}`;
  return records ? `${header}\n${records}` : header;
}
