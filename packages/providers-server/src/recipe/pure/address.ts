// SSRF address guard (decision-15's exception to providers-hold-no-rules). Pure: pure/ cannot
// import node:net, so IPv4 and IPv6 are parsed by hand and judged against contract TASK-74 §9's
// deny list. Fails closed: anything that does not parse is not public.

type V4 = readonly [number, number, number, number];

/** A plain dotted-quad: exactly four decimal octets 0-255, no leading zeros (octal ambiguity). */
function parseIPv4(input: string): V4 | null {
  const parts = input.split('.');
  if (parts.length !== 4) return null;
  const bytes: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    if (part.length > 1 && part.startsWith('0')) return null;
    const n = Number(part);
    if (n > 255) return null;
    bytes.push(n);
  }
  return bytes as unknown as V4;
}

/**
 * A full IPv6 literal, by hand: at most one `::` compression, 1-4 hex digits per group, and an
 * embedded dotted IPv4 literal allowed only as the final group (IPv4-mapped/-compatible/NAT64
 * forms). Returns the 16 address bytes, or null for anything that does not parse.
 */
function parseIPv6(input: string): Uint8Array | null {
  if (input === '') return null;
  const doubleColonParts = input.split('::');
  if (doubleColonParts.length > 2) return null; // at most one '::'

  let text = input;
  if (text.includes('.')) {
    const lastColon = text.lastIndexOf(':');
    if (lastColon === -1) return null;
    const v4 = parseIPv4(text.slice(lastColon + 1));
    if (!v4) return null;
    // Re-expresses the embedded IPv4 as the two hex groups it occupies, so the rest of the
    // parser never has to think about dotted notation again.
    const hi = ((v4[0] << 8) | v4[1]).toString(16);
    const lo = ((v4[2] << 8) | v4[3]).toString(16);
    text = `${text.slice(0, lastColon + 1)}${hi}:${lo}`;
  }

  const parts = text.split('::');
  const hasCompression = parts.length === 2;
  if (parts.length > 2) return null;
  const [headText = '', tailText = ''] = parts;

  const headGroups = headText === '' ? [] : headText.split(':');
  const tailGroups = hasCompression ? (tailText === '' ? [] : tailText.split(':')) : [];

  const allGroups = [...headGroups, ...tailGroups];
  if (allGroups.some((g) => !/^[0-9a-fA-F]{1,4}$/.test(g))) return null;

  const total = headGroups.length + tailGroups.length;
  if (hasCompression) {
    if (total > 7) return null; // '::' must stand for at least one zero group
  } else if (total !== 8) {
    return null;
  }

  const filled = hasCompression ? [...headGroups, ...Array(8 - total).fill('0'), ...tailGroups] : headGroups;
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const value = parseInt(filled[i], 16);
    bytes[i * 2] = (value >> 8) & 0xff;
    bytes[i * 2 + 1] = value & 0xff;
  }
  return bytes;
}

/** Contract §9's IPv4 deny list. */
function isPublicV4(b: V4): boolean {
  const denied =
    b[0] === 0 || // 0.0.0.0/8
    b[0] === 10 || // 10/8
    (b[0] === 100 && b[1] >= 64 && b[1] <= 127) || // 100.64/10
    b[0] === 127 || // 127/8
    (b[0] === 169 && b[1] === 254) || // 169.254/16
    (b[0] === 172 && b[1] >= 16 && b[1] <= 31) || // 172.16/12
    (b[0] === 192 && b[1] === 0 && b[2] === 0) || // 192.0.0/24
    (b[0] === 192 && b[1] === 0 && b[2] === 2) || // 192.0.2/24
    (b[0] === 192 && b[1] === 168) || // 192.168/16
    (b[0] === 198 && (b[1] === 18 || b[1] === 19)) || // 198.18/15
    (b[0] === 198 && b[1] === 51 && b[2] === 100) || // 198.51.100/24
    (b[0] === 203 && b[1] === 0 && b[2] === 113) || // 203.0.113/24
    (b[0] >= 224 && b[0] <= 239) || // 224/4
    b[0] >= 240; // 240/4 (including 255.255.255.255)
  return !denied;
}

/** Contract §9's IPv6 deny list, judged on the 16 parsed bytes. */
function isPublicV6(b: Uint8Array): boolean {
  const zero = (from: number, to: number): boolean => {
    for (let i = from; i < to; i++) if (b[i] !== 0) return false;
    return true;
  };

  const at = (i: number): number => b[i] ?? 0; // in-range by construction (b always has 16 bytes)

  if (zero(0, 12)) return false; // ::/128, ::1 and ::/96 (IPv4-compatible) all have bits 0-95 zero
  if (zero(0, 10) && at(10) === 0xff && at(11) === 0xff) return isPublicV4([at(12), at(13), at(14), at(15)]); // ::ffff:0:0/96, judged by the embedded v4
  if (at(0) === 0x00 && at(1) === 0x64 && at(2) === 0xff && at(3) === 0x9b && zero(4, 12)) return false; // 64:ff9b::/96 (NAT64)
  if (at(0) === 0x00 && at(1) === 0x64 && at(2) === 0xff && at(3) === 0x9b && at(4) === 0x00 && at(5) === 0x01) return false; // 64:ff9b:1::/48 (NAT64)
  if (at(0) === 0x01 && at(1) === 0x00 && zero(2, 8)) return false; // 100::/64
  if (at(0) === 0x20 && at(1) === 0x01 && at(2) === 0x0d && at(3) === 0xb8) return false; // 2001:db8::/32
  if (at(0) === 0x20 && at(1) === 0x02) return false; // 2002::/16 (6to4)
  if ((at(0) & 0xfe) === 0xfc) return false; // fc00::/7
  if (at(0) === 0xfe && (at(1) & 0xc0) === 0x80) return false; // fe80::/10
  if (at(0) === 0xff) return false; // ff00::/8
  return true;
}

/**
 * True only for an address the server may connect to: not loopback, private, link-local,
 * documentation, benchmarking, multicast, reserved or any of the IPv6 transition ranges that can
 * carry one of those (contract §9). Unparseable input fails closed (false). A zone id (`%...`) is
 * stripped before parsing, since it names an interface, not part of the address.
 */
export function isPublicAddress(address: string): boolean {
  const stripped = address.includes('%') ? address.slice(0, address.indexOf('%')) : address;

  const v4 = parseIPv4(stripped);
  if (v4) return isPublicV4(v4);

  const v6 = parseIPv6(stripped);
  if (v6) return isPublicV6(v6);

  return false;
}

/** The import fetcher only ever uses a plain http(s) URL on its default port or 80/443. */
export function isAllowedTarget(url: URL): boolean {
  return (url.protocol === 'http:' || url.protocol === 'https:') && (url.port === '' || url.port === '80' || url.port === '443');
}
