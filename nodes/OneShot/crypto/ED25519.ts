// Copied from https://github.com/paulmillr/noble-ed25519

/*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
/**
 * 4KB JS implementation of ed25519 EDDSA signatures compliant with RFC8032, FIPS 186-5 & ZIP215.
 * @module
 * @example
 * ```js
import * as ed from '@noble/ed25519';
(async () => {
  const privKey = ed.utils.randomPrivateKey();
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey); // Sync methods are also present
  const signature = await ed.signAsync(message, privKey);
  const isValid = await ed.verifyAsync(signature, message, pubKey);
})();
```
 */
const P = 2n ** 255n - 19n;                                     // ed25519 is twisted edwards curve
const N = 2n ** 252n + 27742317777372353535851937790883648493n; // curve's (group) order
const Gx = 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an; // base point x
const Gy = 0x6666666666666666666666666666666666666666666666666666666666666658n; // base point y
const _a = P-1n;
const _d = 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n; // equation param d
const h = 8n;
const MASK = 2n ** 256n;
const L = 32;
const L2 = L * 2;
/**
 * ed25519 curve parameters. Equation is −x² + y² = -a + dx²y².
 * Gx and Gy are generator coordinates. p is field order, n is group order.
 * h is cofactor.
 */
const CURVE: {
  a: bigint; d: bigint; p: bigint; n: bigint; h: bigint; Gx: bigint; Gy: bigint;
} = {
  a: _a,                                               // -1 mod p
  d: _d,                                                // -(121665/121666) mod p
  p: P, n: N, h: h, Gx: Gx, Gy: Gy    // field prime, curve (group) order, cofactor
};
/** Alias to Uint8Array. */
export type Bytes = Uint8Array;
/** Hex-encoded string or Uint8Array. */
export type Hex = Bytes | string;
const err = (m = ''): never => { throw new Error(m); }; // error helper, messes-up stack trace
const isS = (s: unknown): s is string => typeof s === 'string'; // is string
const isB = (s: unknown): s is bigint => typeof s === 'bigint'; // is bigint
const isu8 = (a: unknown): a is Uint8Array => (
  a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array')
);
const abytes = (a: unknown, l?: number): Bytes =>          // is Uint8Array (of specific length)
  !isu8(a) || (typeof l === 'number' && l > 0 && a.length !== l) ?
    err('Uint8Array of valid length expected') : a;
const u8n = (len: number) => new Uint8Array(len);       // creates Uint8Array
const u8fr = (buf: ArrayLike<number>) => Uint8Array.from(buf);
const toU8 = (a: Hex, len?: number) =>
  abytes(isS(a) ? hexToBytes(a) : u8fr(abytes(a)), len);  // norm(hex/u8a) to u8a
const M = (a: bigint, b = P) => { let r = a % b; return r >= 0n ? r : b + r; }; // mod division
const arange = (n: bigint, min: bigint, max: bigint = MASK, msg = 'bad number: out of range'): bigint =>
  isB(n) && min <= n && n < max ? n : err(msg);
const apoint = (p: unknown) => (p instanceof Point ? p : err('Point expected')); // is xyzt point
/** Point in 2d xy affine coordinates. */
export interface AffinePoint { x: bigint, y: bigint }
/** Point in xyzt extended coordinates. */
class Point {
  static BASE: Point;
  static ZERO: Point;
  readonly ex: bigint;
  readonly ey: bigint;
  readonly ez: bigint;
  readonly et: bigint;
  constructor(ex: bigint, ey: bigint, ez: bigint, et: bigint) {
    this.ex = arange(ex, 0n);
    this.ey = arange(ey, 0n);
    this.ez = arange(ez, 1n);
    this.et = arange(et, 0n);
    Object.freeze(this);
  }
  static fromAffine(p: AffinePoint): Point { return new Point(p.x, p.y, 1n, M(p.x * p.y)); }
  /** RFC8032 5.1.3: hex / Uint8Array to Point. */
  static fromBytes(hex: Bytes, zip215 = false): Point {
    const d = _d;
    abytes(hex, L);
    const normed = hex.slice();                         // copy the array to not mess it up
    const lastByte = hex[31];
    normed[31] = lastByte & ~0x80;                      // adjust first LE byte = last BE byte
    const y = bytesToNum_LE(normed);                    // decode as little-endian, convert to num
    const max = zip215 ? MASK : P;                      // RFC8032 prohibits >= p, ZIP215 doesn't
    arange(y, 0n, max);                                 // zip215=true:  0 <= y < 2^256
                                                        // zip215=false: 0 <= y < 2^255-19
    const y2 = M(y * y);                                // y²
    const u = M(y2 - 1n);                               // u=y²-1
    const v = M(d * y2 + 1n);                           // v=dy²+1
    let { isValid, value: x } = uvRatio(u, v);          // (uv³)(uv⁷)^(p-5)/8; square root
    if (!isValid) err('bad y coord 3');                 // not square root: bad point
    const isXOdd = (x & 1n) === 1n;                     // adjust sign of x coordinate
    const isLastByteOdd = (lastByte & 0x80) !== 0;      // x_0, last bit
    if (!zip215 && x === 0n && isLastByteOdd) err('bad y coord 4'); // x=0 and x_0 = 1
    if (isLastByteOdd !== isXOdd) x = M(-x);
    return new Point(x, y, 1n, M(x * y));               // Z=1, T=xy
  }
  static fromHex(hex: Hex, zip215?: boolean): Point {
    return Point.fromBytes(toU8(hex), zip215);
  }
  get x(): bigint { return this.toAffine().x; }         // .x, .y will call expensive toAffine.
  get y(): bigint { return this.toAffine().y; }         // Should be used with care.
  assertValidity(): boolean {
    const a = _a;
    const d = _d;
    const p = this;
    if (p.is0()) throw new Error('bad point: ZERO'); // TODO: optimize, with vars below?
    // Equation in affine coordinates: ax² + y² = 1 + dx²y²
    // Equation in projective coordinates (X/Z, Y/Z, Z):  (aX² + Y²)Z² = Z⁴ + dX²Y²
    const { ex: X, ey: Y, ez: Z, et: T } = p;
    const X2 = M(X * X); // X²
    const Y2 = M(Y * Y); // Y²
    const Z2 = M(Z * Z); // Z²
    const Z4 = M(Z2 * Z2); // Z⁴
    const aX2 = M(X2 * a); // aX²
    const left = M(Z2 * M(aX2 + Y2)); // (aX² + Y²)Z²
    const right = M(Z4 + M(d * M(X2 * Y2))); // Z⁴ + dX²Y²
    if (left !== right) throw new Error('bad point: equation left != right (1)');
    // In Extended coordinates we also have T, which is x*y=T/Z: check X*Y == Z*T
    const XY = M(X * Y);
    const ZT = M(Z * T);
    if (XY !== ZT) throw new Error('bad point: equation left != right (2)');
    return true;
  }
  equals(other: Point): boolean {                       // equality check: compare points
    const { ex: X1, ey: Y1, ez: Z1 } = this;
    const { ex: X2, ey: Y2, ez: Z2 } = apoint(other);  // isPoint() checks class equality
    const X1Z2 = M(X1 * Z2), X2Z1 = M(X2 * Z1);
    const Y1Z2 = M(Y1 * Z2), Y2Z1 = M(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }
  is0(): boolean { return this.equals(I); }
  negate(): Point {                                     // negate: flip over the affine x coordinate
    return new Point(M(-this.ex), this.ey, this.ez, M(-this.et));
  }
  /** Point doubling. Complete formula. */
  double(): Point {
    const { ex: X1, ey: Y1, ez: Z1 } = this;            // Cost: 4M + 4S + 1*a + 6add + 1*2
    const a = _a;
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    const A = M(X1 * X1); const B = M(Y1 * Y1); const C = M(2n * M(Z1 * Z1));
    const D = M(a * A); const x1y1 = X1 + Y1; const E = M(M(x1y1 * x1y1) - A - B);
    const G = D + B; const F = G - C; const H = D - B;
    const X3 = M(E * F); const Y3 = M(G * H); const T3 = M(E * H); const Z3 = M(F * G);
    return new Point(X3, Y3, Z3, T3);
  }
  /** Point addition. Complete formula. */
  add(other: Point): Point {
    const { ex: X1, ey: Y1, ez: Z1, et: T1 } = this;    // Cost: 8M + 1*k + 8add + 1*2.
    const { ex: X2, ey: Y2, ez: Z2, et: T2 } = apoint(other); // doesn't check if other on-curve
    const a = _a;
    const d = _d;
    // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#addition-add-2008-hwcd-3
    const A = M(X1 * X2); const B = M(Y1 * Y2);  const C = M(T1 * d * T2);
    const D = M(Z1 * Z2); const E = M((X1 + Y1) * (X2 + Y2) - A - B);
    const F = M(D - C);   const G = M(D + C);    const H = M(B - a * A);
    const X3 = M(E * F);  const Y3 = M(G * H);   const T3 = M(E * H); const Z3 = M(F * G);
    return new Point(X3, Y3, Z3, T3);
  }
  mul(n: bigint, safe = true): Point {                  // Multiply point by scalar n
    if (n === 0n) return safe === true ? err('cannot multiply by 0') : I;
    arange(n, 1n, N);
    if (n === 1n || (!safe && this.is0())) return this; // safe=true bans 0. safe=false allows 0.
    if (this.equals(G)) return wNAF(n).p;               // use wNAF precomputes for base points
    let p = I, f = G;                                   // init result point & fake point
    for (let d: Point = this; n > 0n; d = d.double(), n >>= 1n) { // double-and-add ladder
      if (n & 1n) p = p.add(d);                         // if bit is present, add to point
      else if (safe) f = f.add(d);                      // if not, add to fake for timing safety
    }
    return p;
  }
  multiply(scalar: bigint): Point { return this.mul(scalar); } // Aliases for compatibilty
  clearCofactor(): Point { return this.mul(BigInt(h), false); } // multiply by cofactor
  isSmallOrder(): boolean { return this.clearCofactor().is0(); } // check if P is small order
  isTorsionFree(): boolean {                            // multiply by big number CURVE.n
    let p = this.mul(N / 2n, false).double();           // ensures the point is not "bad".
    if (N % 2n) p = p.add(this); // P^(N+1)             // P*N == (P*(N/2))*2+P
    return p.is0();
  }
  /** converts point to 2d xy affine point. (x, y, z, t) ∋ (x=x/z, y=y/z, t=xy). */
  toAffine(): AffinePoint {
    const { ex: x, ey: y, ez: z } = this;
    if (this.equals(I)) return { x: 0n, y: 1n };        // fast-path for zero point
    const iz = invert(z, P);                            // z^-1: invert z
    if (M(z * iz) !== 1n) err('invalid inverse');       // (z * z^-1) must be 1, otherwise bad math
    return { x: M(x * iz), y: M(y * iz) }               // x = x*z^-1; y = y*z^-1
  }
  toBytes(): Bytes {                                    // Encode to Uint8Array
    const { x, y } = this.toAffine();                   // convert to affine 2d point
    this.assertValidity();
    const b = numToBytes_32LE(y);                       // encode number to 32 bytes
    b[31] |= x & 1n ? 0x80 : 0;                         // store sign in first LE byte
    return b;
  }
  toHex(): string { return bytesToHex(this.toBytes());} // encode to hex string

  // legacy
  toRawBytes(): Bytes { return this.toBytes(); }
}
/** Generator / base point */
const G: Point = new Point(Gx, Gy, 1n, M(Gx * Gy));
/** Identity / zero point */
const I: Point = new Point(0n, 1n, 1n, 0n);
// Static aliases
Point.BASE = G;
Point.ZERO = I;
const padh = (num: number | bigint, pad: number) => num.toString(16).padStart(pad, '0')
const bytesToHex = (b: Bytes): string => Array.from(abytes(b)).map(e => padh(e, 2)).join(''); // bytes to hex
const C = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 } as const; // ASCII characters
const _ch = (ch: number): number | undefined => {
  if (ch >= C._0 && ch <= C._9) return ch - C._0;       // '2' => 50-48
  if (ch >= C.A && ch <= C.F) return ch - (C.A - 10);   // 'B' => 66-(65-10)
  if (ch >= C.a && ch <= C.f) return ch - (C.a - 10);   // 'b' => 98-(97-10)
  return;
};
const hexToBytes = (hex: string): Bytes => {            // hex to bytes
  const e = 'hex invalid';
  if (!isS(hex)) return err(e);
  const hl = hex.length, al = hl / 2;
  if (hl % 2) return err(e);
  const array = u8n(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {    // treat each char as ASCII
    const n1 = _ch(hex.charCodeAt(hi));                 // parse first char, multiply it by 16
    const n2 = _ch(hex.charCodeAt(hi + 1));             // parse second char
    if (n1 === undefined || n2 === undefined) return err(e);
    array[ai] = n1 * 16 + n2;                           // example: 'A9' => 10*16 + 9
  }
  return array;
};
const numToBytes_32LE = (num: bigint) => hexToBytes(padh(num, L2)).reverse();
const bytesToNum_LE = (b: Bytes): bigint =>
  BigInt('0x' + bytesToHex(u8fr(abytes(b)).reverse()));
const concatBytes = (...arrs: Bytes[]) => {             // concatenate Uint8Array-s
  const r = u8n(arrs.reduce((sum, a) => sum + abytes(a).length, 0)); // create u8a of summed length
  let pad = 0;                                          // walk through each array,
  arrs.forEach(a => {r.set(a, pad); pad += a.length});  // ensure they have proper type
  return r;
};
const invert = (num: bigint, md: bigint): bigint => {   // modular inversion
  if (num === 0n || md <= 0n) err('no inverse n=' + num + ' mod=' + md); // no neg exponent for now
  let a = M(num, md), b = md, x = 0n, y = 1n, u = 1n, v = 0n;
  while (a !== 0n) {                                    // uses euclidean gcd algorithm
    const q = b / a, r = b % a;                         // not constant-time
    const m = x - u * q, n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  return b === 1n ? M(x, md) : err('no inverse');       // b is gcd at this point
};
const pow2 = (x: bigint, power: bigint): bigint => {    // pow2(x, 4) == x^(2^4)
  let r = x;
  while (power-- > 0n) { r *= r; r %= P; }
  return r;
}
const pow_2_252_3 = (x: bigint) => {                    // x^(2^252-3) unrolled util for square root
  const x2 = (x * x) % P;                               // x^2,       bits 1
  const b2 = (x2 * x) % P;                              // x^3,       bits 11
  const b4 = (pow2(b2, 2n) * b2) % P;                   // x^(2^4-1), bits 1111
  const b5 = (pow2(b4, 1n) * x) % P;                    // x^(2^5-1), bits 11111
  const b10 = (pow2(b5, 5n) * b5) % P;                  // x^(2^10)
  const b20 = (pow2(b10, 10n) * b10) % P;               // x^(2^20)
  const b40 = (pow2(b20, 20n) * b20) % P;               // x^(2^40)
  const b80 = (pow2(b40, 40n) * b40) % P;               // x^(2^80)
  const b160 = (pow2(b80, 80n) * b80) % P;              // x^(2^160)
  const b240 = (pow2(b160, 80n) * b80) % P;             // x^(2^240)
  const b250 = (pow2(b240, 10n) * b10) % P;             // x^(2^250)
  const pow_p_5_8 = (pow2(b250, 2n) * x) % P; // < To pow to (p+3)/8, multiply it by x.
  return { pow_p_5_8, b2 };
}
const RM1 = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n; // √-1
const uvRatio = (u: bigint, v: bigint): { isValid: boolean, value: bigint } => { // for sqrt comp
  const v3 = M(v * v * v);                              // v³
  const v7 = M(v3 * v3 * v);                            // v⁷
  const pow = pow_2_252_3(u * v7).pow_p_5_8;            // (uv⁷)^(p-5)/8
  let x = M(u * v3 * pow);                              // (uv³)(uv⁷)^(p-5)/8
  const vx2 = M(v * x * x);                             // vx²
  const root1 = x;                                      // First root candidate
  const root2 = M(x * RM1);                             // Second root candidate; RM1 is √-1
  const useRoot1 = vx2 === u;                           // If vx² = u (mod p), x is a square root
  const useRoot2 = vx2 === M(-u);                       // If vx² = -u, set x <-- x * 2^((p-1)/4)
  const noRoot = vx2 === M(-u * RM1);                   // There is no valid root, vx² = -u√-1
  if (useRoot1) x = root1;
  if (useRoot2 || noRoot) x = root2;                    // We return root2 anyway, for const-time
  if ((M(x) & 1n) === 1n) x = M(-x);                    // edIsNegative
  return { isValid: useRoot1 || useRoot2, value: x };
}
const modL_LE = (hash: Bytes): bigint => M(bytesToNum_LE(hash), N); // modulo L; but little-endian
/** etc.sha512Sync should conform to the interface. */
export type Sha512FnSync = undefined | ((...messages: Bytes[]) => Bytes);
const sha512a = (...m: Bytes[]) => etc.sha512Async(...m);  // Async SHA512
const sha512s = (...m: Bytes[]) => {                       // Sync SHA512, not set by default
  const fn = etc.sha512Sync;
  if (typeof fn !== 'function') err('etc.sha512Sync not set');
  return fn!(...m);
};
type ExtK = { head: Bytes, prefix: Bytes, scalar: bigint, point: Point, pointBytes: Bytes };
const hash2extK = (hashed: Bytes): ExtK => {            // RFC8032 5.1.5
  const head = hashed.slice(0, L);                     // slice creates a copy, unlike subarray
  head[0] &= 248;                                       // Clamp bits: 0b1111_1000,
  head[31] &= 127;                                      // 0b0111_1111,
  head[31] |= 64;                                       // 0b0100_0000
  const prefix = hashed.slice(L, L2);                  // private key "prefix"
  const scalar = modL_LE(head);                         // modular division over curve order
  const point = G.mul(scalar);                          // public key point
  const pointBytes = point.toBytes();                   // point serialized to Uint8Array
  return { head, prefix, scalar, point, pointBytes };
}
// RFC8032 5.1.5; getPublicKey async, sync. Hash priv key and extract point.
const getExtendedPublicKeyAsync = (priv: Hex) => sha512a(toU8(priv, L)).then(hash2extK);
const getExtendedPublicKey = (priv: Hex) => hash2extK(sha512s(toU8(priv, L)))
/** Creates 32-byte ed25519 public key from 32-byte private key. Async. */
const getPublicKeyAsync = (priv: Hex): Promise<Bytes> =>
  getExtendedPublicKeyAsync(priv).then(p => p.pointBytes)
/** Creates 32-byte ed25519 public key from 32-byte private key. To use, set `etc.sha512Sync` first. */
const getPublicKey = (priv: Hex): Bytes => getExtendedPublicKey(priv).pointBytes;
type Finishable<T> = {                                  // Reduces logic duplication between
  hashable: Bytes, finish: (hashed: Bytes) => T         // sync & async versions of sign(), verify()
}
const hashFinishA = <T>(res: Finishable<T>): Promise<T> => sha512a(res.hashable).then(res.finish);
const hashFinishS = <T>(res: Finishable<T>): T => res.finish(sha512s(res.hashable));
const _sign = (e: ExtK, rBytes: Bytes, msg: Bytes): Finishable<Bytes> => { // sign() shared code
  const { pointBytes: P, scalar: s } = e;
  const r = modL_LE(rBytes);                            // r was created outside, reduce it modulo L
  const R = G.mul(r).toBytes();                         // R = [r]B
  const hashable = concatBytes(R, P, msg);              // dom2(F, C) || R || A || PH(M)
  const finish = (hashed: Bytes): Bytes => {            // k = SHA512(dom2(F, C) || R || A || PH(M))
    const S = M(r + modL_LE(hashed) * s, N);            // S = (r + k * s) mod L; 0 <= s < l
    return abytes(concatBytes(R, numToBytes_32LE(S)), L2); // 64-byte sig: 32b R.x + 32b LE(S)
  }
  return { hashable, finish };
};
/** Signs message (NOT message hash) using private key. Async. */
const signAsync = async (msg: Hex, privKey: Hex): Promise<Bytes> => {
  const m = toU8(msg);                                  // RFC8032 5.1.6: sign msg with key async
  const e = await getExtendedPublicKeyAsync(privKey);   // pub,prfx
  const rBytes = await sha512a(e.prefix, m);            // r = SHA512(dom2(F, C) || prefix || PH(M))
  return hashFinishA(_sign(e, rBytes, m));              // gen R, k, S, then 64-byte signature
};
/** Signs message (NOT message hash) using private key. To use, set `etc.sha512Sync` first. */
const sign = (msg: Hex, privKey: Hex): Bytes => {
  const m = toU8(msg);                                  // RFC8032 5.1.6: sign msg with key sync
  const e = getExtendedPublicKey(privKey);              // pub,prfx
  const rBytes = sha512s(e.prefix, m);                  // r = SHA512(dom2(F, C) || prefix || PH(M))
  return hashFinishS(_sign(e, rBytes, m));              // gen R, k, S, then 64-byte signature
};
/** Verification options. zip215: true (default) follows ZIP215 spec. false would follow RFC8032. */
export type VerifOpts = { zip215?: boolean };
const dvo: VerifOpts = { zip215: true };
const _verify = (sig: Hex, msg: Hex, pub: Hex, opts: VerifOpts = dvo): Finishable<boolean> => {
  sig = toU8(sig, L2);                                  // Signature hex str/Bytes, must be 64 bytes
  msg = toU8(msg);                                      // Message hex str/Bytes
  pub = toU8(pub, L);
  const { zip215 } = opts;                              // switch between zip215 and rfc8032 verif
  let A: Point, R: Point, s: bigint, SB: Point, hashable = Uint8Array.of();
  try {
    A = Point.fromHex(pub, zip215);                     // public key A decoded
    R = Point.fromHex(sig.slice(0, L), zip215);        // 0 <= R < 2^256: ZIP215 R can be >= P
    s = bytesToNum_LE(sig.slice(L, L2));               // Decode second half as an integer S
    SB = G.mul(s, false);                               // in the range 0 <= s < L
    hashable = concatBytes(R.toBytes(), A.toBytes(), msg);  // dom2(F, C) || R || A || PH(M)
  } catch (error) {}
  const finish = (hashed: Bytes): boolean => {          // k = SHA512(dom2(F, C) || R || A || PH(M))
    if (SB == null) return false;                       // false if try-catch catched an error
    if (!zip215 && A.isSmallOrder()) return false;      // false for SBS: Strongly Binding Signature
    const k = modL_LE(hashed);                          // decode in little-endian, modulo L
    const RkA = R.add(A.mul(k, false));                 // [8]R + [8][k]A'
    return RkA.add(SB.negate()).clearCofactor().is0();  // [8][S]B = [8]R + [8][k]A'
  }
  return { hashable, finish };
};
// RFC8032 5.1.7: verification async, sync

/** Verifies signature on message and public key. Async. */
const verifyAsync = async (s: Hex, m: Hex, p: Hex, opts: VerifOpts = dvo): Promise<boolean> =>
  hashFinishA(_verify(s, m, p, opts));
/** Verifies signature on message and public key. To use, set `etc.sha512Sync` first. */
const verify = (s: Hex, m: Hex, p: Hex, opts: VerifOpts = dvo): boolean =>
  hashFinishS(_verify(s, m, p, opts));
declare const globalThis: Record<string, any> | undefined; // Typescript symbol present in browsers
const cr = () => globalThis?.crypto
const subtle = () => cr()?.subtle ?? err('crypto.subtle must be defined');
const rand = (len = 32): Bytes => {                   // CSPRNG (random number generator)
  const c = cr(); // Can be shimmed in node.js <= 18 to prevent error:
  if (!c?.getRandomValues) err('crypto.getRandomValues must be defined');
  return c.getRandomValues(u8n(len));
};
/** Math, hex, byte helpers. Not in `utils` because utils share API with noble-curves. */
const etc = {
  sha512Async: async (...messages: Bytes[]): Promise<Bytes> => {
    const s = subtle();
    const m = concatBytes(...messages);
    return u8n(await s.digest('SHA-512', m.buffer));
  },
  sha512Sync: undefined as Sha512FnSync,                // Actual logic below

  bytesToHex: bytesToHex satisfies (b: Bytes) => string as (b: Bytes) => string,
  hexToBytes: hexToBytes satisfies (hex: string) => Bytes as (hex: string) => Bytes,
  concatBytes: concatBytes satisfies (...arrs: Bytes[]) => Uint8Array as (...arrs: Bytes[]) => Uint8Array,
  mod: M satisfies (a: bigint, b?: bigint) => bigint as (a: bigint, b?: bigint) => bigint,
  invert: invert as (num: bigint, md: bigint) => bigint,
  randomBytes: rand as typeof rand,
};
/** ed25519-specific key utilities. */
const utils = {
  getExtendedPublicKeyAsync: getExtendedPublicKeyAsync as (priv: Hex) => Promise<ExtK>,
  getExtendedPublicKey: getExtendedPublicKey as (priv: Hex) => ExtK,
  randomPrivateKey: (): Bytes => rand(L),
  precompute: (w=8, p: Point = G): Point => { p.multiply(3n); w; return p; }, // no-op
}
const W = 8;                                            // Precomputes-related code. W = window size
const scalarBits = 256;
const pwindows = Math.ceil(scalarBits / W) + 1;
const pwindowSize = 2 ** (W - 1);
const precompute = () => {                              // They give 12x faster getPublicKey(),
  const points: Point[] = [];                           // 10x sign(), 2x verify(). To achieve this,
  let p = G, b = p;                                     // a lot of points related to base point G.
  for (let w = 0; w < pwindows; w++) {                  // Points are stored in array and used
    b = p;                                              // any time Gx multiplication is done.
    points.push(b);                                     // They consume 16-32 MiB of RAM.
    for (let i = 1; i < pwindowSize; i++) { b = b.add(p); points.push(b); }
    p = b.double();                                     // Precomputes don't speed-up getSharedKey,
  }                                                     // which multiplies user point by scalar,
  return points;                                        // when precomputes are using base point
}
let Gpows: Point[] | undefined = undefined;             // precomputes for base point G
const wNAF = (n: bigint): { p: Point; f: Point } => {   // w-ary non-adjacent form (wNAF) method.
                                                        // Compared to other point mult methods,
  const comp = Gpows || (Gpows = precompute());         // stores 2x less points using subtraction
  const ctneg = (cnd: boolean, p: Point) => { let n = p.negate(); return cnd ? n : p; } // negate
  let p = I, f = G;                                     // f must be G, or could become I in the end
  const pow_2_w = 2 ** W;                               // W=8 256
  const maxNum = pow_2_w;                               // W=8 256
  const mask = BigInt(pow_2_w - 1);                     // W=8 255 == mask 0b11111111
  const shiftBy = BigInt(W);                            // W=8 8
  for (let w = 0; w < pwindows; w++) {
    let wbits = Number(n & mask);                       // extract W bits.
    n >>= shiftBy;                                      // shift number by W bits.
    if (wbits > pwindowSize) {wbits -= maxNum; n += 1n;}// split if bits > max: +224 => 256-32
    const off = w * pwindowSize;
    const offF = off, offP = off + Math.abs(wbits) - 1; // offsets, evaluate both
    const isEven = w % 2 !== 0, isNeg = wbits < 0;      // conditions, evaluate both
    if (wbits === 0) {
      f = f.add(ctneg(isEven, comp[offF]));             // bits are 0: add garbage to fake point
    } else {                                            //          ^ can't add off2, off2 = I
      p = p.add(ctneg(isNeg, comp[offP]));              // bits are 1: add to result point
    }
  }
  return { p, f }                                       // return both real and fake points for JIT
};        // !! you can disable precomputes by commenting-out call of the wNAF() inside Point#mul()
// !! Remove the export to easily use in REPL / browser console
export {
  CURVE, etc, Point as ExtendedPoint, getPublicKey, getPublicKeyAsync, Point, sign,
  signAsync, utils, verify, verifyAsync
};