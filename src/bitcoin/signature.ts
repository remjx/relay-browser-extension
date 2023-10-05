import { etc } from '@noble/secp256k1'

/* From @relayx/crypto src/bitcoin/signature.ts */
export function toDer(r: bigint, s: bigint) {
    const rnbuf = etc.numberToBytesBE(r);
    const snbuf = etc.numberToBytesBE(s);
  
    const rneg = !!(rnbuf[0] & 0x80);
    const sneg = !!(snbuf[0] & 0x80);
  
    const rbuf = rneg ? Buffer.concat([Buffer.from([0x00]), rnbuf]) : rnbuf;
    const sbuf = sneg ? Buffer.concat([Buffer.from([0x00]), snbuf]) : snbuf;
  
    const rlength = rbuf.length;
    const slength = sbuf.length;
    const length = 2 + rlength + 2 + slength;
    const rheader = 0x02;
    const sheader = 0x02;
    const header = 0x30;
  
    const der = Buffer.concat([
      Buffer.from([header, length, rheader, rlength]),
      rbuf,
      Buffer.from([sheader, slength]),
      sbuf
    ]);
  
    return der;
  }