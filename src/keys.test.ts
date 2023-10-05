import { it, expect, describe, vi } from 'vitest';
import * as keysStorage from './keys';

vi.mock('./storage')

describe("keys.sign()", () => {
  it("signs tx correctly", async () => {
    const signature = await keysStorage.default.sign(Buffer.from('ffffffffffffffffffffffffffffffff'), 0, 0)
    expect(signature.toString('hex')).toBe('483045022100ab291447018facd9f5af9010386bb48de1651293f0e0751cd3ea0e6db1c704a30220519b3b4a28d158330adacfb449d016e5994b3e33463964704622eeca799e60b5412102e4c7a770deb1b21b6c9ac9700799b82cd9924982bfdffe355bfb027e7ff7f8bb')
  })
})
