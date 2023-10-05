/* From @relayx/crypto src/bitcoin/utils.ts */
function trim(buf: Buffer, natlen: number) {
  return buf.slice(natlen - buf.length, buf.length)
}

/* From @relayx/crypto src/bitcoin/utils.ts */
function pad(buf: Buffer, natlen: number, size: number) {
  const rbuf = Buffer.alloc(size)
  for (let i = 0; i < buf.length; i++) {
    rbuf[rbuf.length - 1 - i] = buf[buf.length - 1 - i]
  }
  for (let i = 0; i < size - natlen; i++) {
    rbuf[i] = 0
  }
  return rbuf
}

/* From @relayx/crypto src/bitcoin/utils.ts */
export function BNToBuffer(bn: bigint, opts?: { size: number }) {
  let buf
  let hex
  if (opts && opts.size) {
    hex = bn.toString(16)
    if (hex.length % 2) {
      hex = '0' + hex
    }
    const natlen = hex.length / 2
    buf = Buffer.from(hex, 'hex')

    if (natlen === opts.size) {
      // buf = buf
    } else if (natlen > opts.size) {
      buf = trim(buf, natlen)
    } else if (natlen < opts.size) {
      buf = pad(buf, natlen, opts.size)
    }
  } else {
    hex = bn.toString(16)
    if (hex.length % 2) {
      hex = '0' + hex
    }

    buf = Buffer.from(hex, 'hex')
  }

  return buf
}
