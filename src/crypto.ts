import * as bip39 from '@scure/bip39'
import { HDKey } from '@scure/bip32'
import { hex, base64 } from '@scure/base'
import { sha256 } from '@noble/hashes/sha256'
import { sha512 } from '@noble/hashes/sha512'
import { hmac } from '@noble/hashes/hmac'
import { wordlist } from '@scure/bip39/wordlists/english'
import { sign, etc, getPublicKey } from '@noble/secp256k1'
import { p2pkh } from '@scure/btc-signer'
etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, etc.concatBytes(...m))

const cache = new Map<string, KEYS>()

interface KEYS {
  identity: bigint
  receive: bigint
  change: bigint
  run: bigint
  baton: bigint
  receiveAddress: string
  changeAddress: string
  runAddress: string
  batonAddress: string
}

export async function getKeysFromEntropy(entropy: string): Promise<KEYS> {
  const seed = await bip39.mnemonicToSeed(
    bip39.entropyToMnemonic(hex.decode(entropy), wordlist),
    '',
  )
  const hdkey = HDKey.fromMasterSeed(seed)!
  const identity = etc.bytesToNumberBE(
    hdkey.derive("m/0'/236'/0'/0/0").privateKey!,
  )
  const receive = etc.bytesToNumberBE(
    hdkey.derive("m/44'/236'/0'/0/0").privateKey!,
  )
  const change = etc.bytesToNumberBE(
    hdkey.derive("m/44'/236'/0'/1/0").privateKey!,
  )
  const run = etc.bytesToNumberBE(hdkey.derive("m/44'/236'/0'/2/0").privateKey!)
  const baton = etc.bytesToNumberBE(
    hdkey.derive("m/44'/236'/0'/3/0").privateKey!,
  )
  return {
    identity,
    receive,
    change,
    run,
    baton,
    receiveAddress: p2pkh(getPublicKey(receive)).address!,
    changeAddress: p2pkh(getPublicKey(change)).address!,
    runAddress: p2pkh(getPublicKey(run)).address!,
    batonAddress: p2pkh(getPublicKey(baton)).address!,
  }
}

export async function getKeys(entropy: string): Promise<KEYS> {
  if (!cache.has(entropy)) cache.set(entropy, await getKeysFromEntropy(entropy))
  return cache.get(entropy)!
}

const MAGIC_BYTES = Uint8Array.from(
  'Bitcoin Signed Message:\n'.split('').map((x) => x.charCodeAt(0)),
)

function magicHash(messageBuffer: Uint8Array) {
  const prefix1 = new Uint8Array([MAGIC_BYTES.length])
  const prefix2 = new Uint8Array([messageBuffer.length])
  const buf = etc.concatBytes(prefix1, MAGIC_BYTES, prefix2, messageBuffer)
  const hash = sha256sha256(buf)
  return hash
}

export async function signMessage(message: Uint8Array, key: bigint) {
  const sig = sign(magicHash(message), etc.numberToBytesBE(key))
  return base64.encode(
    etc.concatBytes(
      new Uint8Array([27 + sig.recovery! + 4]),
      sig.toCompactRawBytes(),
    ),
  )
}

export function sha256sha256(message: Uint8Array) {
  return sha256(sha256(message))
}

export { sha512 }
