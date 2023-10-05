import { it, expect, describe } from 'vitest';
import {hex} from '@scure/base'
import { getKeysFromEntropy, signMessage } from './crypto';

describe("getKeysFromEntropy", () => {
it("should correctly derive keys", async () => {
  const keys = await getKeysFromEntropy('0000000000000000000000000000000000000000000000000000000000000000')
  expect(keys.receiveAddress).toEqual('1CdVnYjyzhd9puUw8unH4tLUDEcykRh7Ro')
  expect(keys.changeAddress).toEqual('1FxXoteihaDKCN2N1YKe7oeYRXfK1SZtGr')
  expect(keys.runAddress).toEqual('1GvqXxH2fT3KqkgZDmtfokRAxn3NbE2qEX')
  expect(keys.batonAddress).toEqual('14KrLGXWL7uArapUxezaV7VizymirSLBxA')
  expect(keys.identity.toWIF()).toEqual('KxpXrR9yK8bqoVupEpNjEMowZWHHXfx1MhmtE6KZgY2h2ZfEz1RX')
  expect(keys.receive.toWIF()).toEqual('KzrBXcvYLNa1wv5afs3ugTnMbrZkk3x6iqyFzz2Zacg84EnRaP3N')
  expect(keys.change.toWIF()).toEqual('L5JJLpBpSbCHhsZBvEghrBnLvu9s6dEnXJNBjiVuohA1oCopUdLe')
  expect(keys.run.toWIF()).toEqual('KyKvpgVjRfGWZaEdXe8Err55dpku9QTnjHK4B3uGeybiE1EtHMfm')
  expect(keys.baton.toWIF()).toEqual('L3dQZNaoxSHcQJKXcaMWHiwBFQXwbjjnENKMyx8H6CkEQRwqqgQc')
})
})

describe("signMessage", () => {
  it("should sign message correctly", async () => {
    const keys = await getKeysFromEntropy('0000000000000000000000000000000000000000000000000000000000000000')
    const message = await signMessage(hex.decode('ffff'), keys.identity)
    expect( message).toEqual('ILiN3P/WtuGzg5SLfjzfGxIMklfHUNh0oKCKRuvmNAQkMoAM//n4dDVIZocjJn4jFn0Z40DwEGRAHuCOdE7i0lc=')
  })
})
