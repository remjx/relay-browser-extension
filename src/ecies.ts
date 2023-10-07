import { ProjectivePoint as Point, etc } from '@noble/secp256k1'
import { sha512 } from './crypto'

function getNodeSubtle() {
  const crypto = require('crypto')
  return crypto.webcrypto.subtle as SubtleCrypto
}

export function getSubtle() {
  return (process as any).browser ? crypto.subtle : getNodeSubtle()
}

function isEqualArray(a: Uint8Array, b: Uint8Array) {
  if (a.length != b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] != b[i]) return false
  return true
}

const subtle = getSubtle()

const AESCBC = {
  async encrypt(messagebuf: Uint8Array, keybuf: Uint8Array, ivbuf: Uint8Array) {
    if (keybuf.length !== 16) {
      throw new Error('keybuf length must be 16')
    }
    if (ivbuf.length !== 16) {
      throw new Error('ivbuf length must be 16')
    }
    const key = await subtle.importKey(
      'raw',
      Uint8Array.from(keybuf),
      'AES-CBC',
      false,
      ['encrypt'],
    )
    const encrypted = await subtle.encrypt(
      { name: 'aes-cbc', iv: ivbuf },
      key,
      Uint8Array.from(messagebuf),
    )
    return Buffer.from(encrypted)
  },

  async decrypt(encbuf: Uint8Array, keybuf: Uint8Array, ivbuf: Uint8Array) {
    if (keybuf.length !== 16) {
      throw new Error('keybuf length must be 16')
    }
    if (ivbuf.length !== 16) {
      throw new Error('ivbuf length must be 16')
    }
    const key = await subtle.importKey(
      'raw',
      Uint8Array.from(keybuf),
      'AES-CBC',
      false,
      ['decrypt'],
    )
    const decrypted = await subtle.decrypt(
      { name: 'aes-cbc', iv: Uint8Array.from(ivbuf) },
      key,
      Uint8Array.from(encbuf),
    )

    return Buffer.from(decrypted)
  },
}

function ivkEkM(privateKey: bigint, pubkey: Point) {
  const r = privateKey
  const KB = pubkey
  const P = KB.multiply(r)
  const Sbuf = P.toRawBytes()
  const buf = sha512(Sbuf)

  return [buf.slice(0, 16), buf.slice(16, 32), buf.slice(32, 64)]
}

const BIE1 = Uint8Array.from('BIE1'.split('').map((x) => x.charCodeAt(0)))

// Encrypts the message (String or Buffer).
export async function encrypt(
  privateKey: bigint,
  publicKey: Point,
  message: Uint8Array,
) {
  if (!Buffer.isBuffer(message)) message = Buffer.from(message)
  const [iv, kE, kM] = ivkEkM(privateKey, publicKey)

  const ciphertext = await AESCBC.encrypt(message, kE, iv)
  const encbuf = etc.concatBytes(
    BIE1,
    Point.fromPrivateKey(privateKey).toRawBytes(true),
    ciphertext,
  )

  const hmac = etc.hmacSha256Sync!(kM, encbuf)
  return Buffer.concat([encbuf, hmac])
}

export async function decrypt(privateKey: bigint, encbuf: Uint8Array) {
  const tagLength = 32
  let offset = 4

  const magic = encbuf.slice(0, 4)
  if (!isEqualArray(magic, BIE1)) {
    throw new Error('ECIES: Invalid Magic')
  }
  // BIE1 use compressed public key, length is always 33.
  const pub = encbuf.slice(4, 37)
  const publicKey = Point.fromHex(pub)
  offset = 37

  const ciphertext = encbuf.slice(offset, encbuf.length - tagLength)
  const hmac = encbuf.slice(encbuf.length - tagLength, encbuf.length)
  const [iv, kE, kM] = ivkEkM(privateKey, publicKey)

  const hmac2 = etc.hmacSha256Sync!(
    kM,
    encbuf.slice(0, encbuf.length - tagLength),
  )

  if (!isEqualArray(hmac, hmac2)) {
    throw new Error('ECIES: Invalid checksum')
  }

  return AESCBC.decrypt(ciphertext, kE, iv)
}
