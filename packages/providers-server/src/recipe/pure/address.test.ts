import { describe, expect, it } from 'vitest';
import { isAllowedTarget, isPublicAddress } from './address.ts';

describe('isPublicAddress', () => {
  // AC#2: every IPv4 range in contract §9, one case each.
  const deniedV4: readonly [name: string, address: string][] = [
    ['0.0.0.0/8', '0.0.0.0'],
    ['0.0.0.0/8, non-zero host', '0.1.2.3'],
    ['10/8', '10.0.0.1'],
    ['100.64/10', '100.64.0.1'],
    ['100.64/10, high end', '100.127.255.255'],
    ['127/8 (loopback)', '127.0.0.1'],
    ['169.254/16 (link-local)', '169.254.1.1'],
    ['169.254.169.254 (cloud metadata)', '169.254.169.254'],
    ['172.16/12', '172.16.0.1'],
    ['172.16/12, high end', '172.31.255.255'],
    ['192.0.0/24', '192.0.0.1'],
    ['192.0.2/24 (documentation)', '192.0.2.1'],
    ['192.168/16', '192.168.1.1'],
    ['198.18/15 (benchmarking)', '198.18.0.1'],
    ['198.18/15, high end', '198.19.255.255'],
    ['198.51.100/24 (documentation)', '198.51.100.1'],
    ['203.0.113/24 (documentation)', '203.0.113.1'],
    ['224/4 (multicast)', '224.0.0.1'],
    ['240/4 (reserved)', '240.0.0.1'],
    ['255.255.255.255 (broadcast)', '255.255.255.255'],
  ];

  it.each(deniedV4)('denies %s (%s)', (_name, address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it('allows a public v4 address', () => {
    expect(isPublicAddress('93.184.216.34')).toBe(true);
  });

  // AC#2: every IPv6 range in contract §9, one case each.
  const deniedV6: readonly [name: string, address: string][] = [
    ['::/128 (unspecified)', '::'],
    ['::1 (loopback)', '::1'],
    ['::/96 (IPv4-compatible)', '::0.1.2.3'],
    ['::ffff:0:0/96 (IPv4-mapped, dotted), embeds a private v4', '::ffff:127.0.0.1'],
    ['::ffff:0:0/96 (IPv4-mapped, hex), embeds a private v4', '::ffff:7f00:1'],
    ['64:ff9b::/96 (NAT64)', '64:ff9b::1.2.3.4'],
    ['64:ff9b:1::/48 (NAT64)', '64:ff9b:1::1'],
    ['100::/64', '100::1'],
    ['2001:db8::/32 (documentation)', '2001:db8::1'],
    ['2002::/16 (6to4)', '2002::1'],
    ['fc00::/7 (unique local)', 'fc00::1'],
    ['fc00::/7, high end', 'fdff::1'],
    ['fe80::/10 (link-local)', 'fe80::1'],
    ['fe80::/10, with a zone id', 'fe80::1%eth0'],
    ['ff00::/8 (multicast)', 'ff02::1'],
  ];

  it.each(deniedV6)('denies %s (%s)', (_name, address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it('allows a public v6 address', () => {
    expect(isPublicAddress('2606:4700::1')).toBe(true);
  });

  it('allows an IPv4-mapped address whose embedded v4 is public (judged by the embedded address)', () => {
    expect(isPublicAddress('::ffff:93.184.216.34')).toBe(true);
  });

  it('is compressed-notation aware (:: in the middle)', () => {
    expect(isPublicAddress('2606:4700::6810:84e5')).toBe(true);
  });

  const unparseable: readonly [name: string, address: string][] = [
    ['empty string', ''],
    ['not an address at all', 'not an address'],
    ['bracketed literal (not stripped here)', '[::1]'],
    ['a v4 octet over 255', '256.1.1.1'],
    ['a v4 octet with a leading zero', '127.0.0.01'],
    ['too few v4 octets', '127.0.0'],
    ['v6 with two compressions', '1::2::3'],
    ['v6 group with 5 hex digits', '1:2:3:4:5:6:7:88888'],
    ['v6 with 9 groups and no compression', '1:2:3:4:5:6:7:8:9'],
  ];

  it.each(unparseable)('fails closed (denies) on %s (%s)', (_name, address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
});

describe('isAllowedTarget', () => {
  it('allows http on the default port', () => {
    expect(isAllowedTarget(new URL('http://x.com/path'))).toBe(true);
  });

  it('allows https on the default port', () => {
    expect(isAllowedTarget(new URL('https://x.com/path'))).toBe(true);
  });

  it('allows an explicit port 80', () => {
    expect(isAllowedTarget(new URL('http://x.com:80/path'))).toBe(true);
  });

  it('allows an explicit port 443', () => {
    expect(isAllowedTarget(new URL('https://x.com:443/path'))).toBe(true);
  });

  it('rejects any other port', () => {
    expect(isAllowedTarget(new URL('https://x.com:8443/path'))).toBe(false);
  });

  it('rejects a non-http(s) protocol', () => {
    expect(isAllowedTarget(new URL('ftp://x.com/path'))).toBe(false);
  });
});
