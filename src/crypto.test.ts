import { it, expect, describe } from 'vitest';
import {hex} from '@scure/base'
import {WIF} from '@scure/btc-signer'
import { getKeysFromEntropy, signMessage } from './crypto';
import { etc } from '@noble/secp256k1';

describe("getKeysFromEntropy", () => {
it("should correctly derive keys", async () => {
  const encoder = WIF()
  const keys = await getKeysFromEntropy('0000000000000000000000000000000000000000000000000000000000000000')
  expect(keys.receiveAddress).toEqual('1CdVnYjyzhd9puUw8unH4tLUDEcykRh7Ro')
  expect(keys.changeAddress).toEqual('1FxXoteihaDKCN2N1YKe7oeYRXfK1SZtGr')
  expect(keys.runAddress).toEqual('1GvqXxH2fT3KqkgZDmtfokRAxn3NbE2qEX')
  expect(keys.batonAddress).toEqual('14KrLGXWL7uArapUxezaV7VizymirSLBxA')
  expect(encoder.encode(etc.numberToBytesBE(keys.identity))).toEqual('KxpXrR9yK8bqoVupEpNjEMowZWHHXfx1MhmtE6KZgY2h2ZfEz1RX')
  expect(encoder.encode(etc.numberToBytesBE(keys.receive))).toEqual('KzrBXcvYLNa1wv5afs3ugTnMbrZkk3x6iqyFzz2Zacg84EnRaP3N')
  expect(encoder.encode(etc.numberToBytesBE(keys.change))).toEqual('L5JJLpBpSbCHhsZBvEghrBnLvu9s6dEnXJNBjiVuohA1oCopUdLe')
  expect(encoder.encode(etc.numberToBytesBE(keys.run))).toEqual('KyKvpgVjRfGWZaEdXe8Err55dpku9QTnjHK4B3uGeybiE1EtHMfm')
  expect(encoder.encode(etc.numberToBytesBE(keys.baton))).toEqual('L3dQZNaoxSHcQJKXcaMWHiwBFQXwbjjnENKMyx8H6CkEQRwqqgQc')
})
})

describe("signMessage", () => {
  it("should sign message correctly", async () => {
    const keys = await getKeysFromEntropy('0000000000000000000000000000000000000000000000000000000000000000')
    const message = await signMessage(hex.decode('ffff'), keys.identity)
    expect( message).toEqual('ILiN3P/WtuGzg5SLfjzfGxIMklfHUNh0oKCKRuvmNAQkMoAM//n4dDVIZocjJn4jFn0Z40DwEGRAHuCOdE7i0lc=')
  })
})
