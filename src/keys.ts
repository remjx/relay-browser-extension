import PrivateKey from "@relayx/crypto/lib/bitcoin/PrivateKey";
import { sign, toDer } from '@relayx/crypto/lib/bitcoin/signature';
import {SIGHASH_ALL, SIGHASH_FORKID} from '@relayx/crypto/lib/bitcoin/sighash'
import { serialize } from '@relayx/crypto/lib/bitcoin/script';
import BufferWriter from '@relayx/crypto/lib/bitcoin/BufferWriter';
import { KeyStorage } from "@relayx/wallet/lib/auth";
import {get, set, clear} from './storage'
import { getKeys } from "./crypto";


const keys: KeyStorage = {
  async hasKeys(): Promise<boolean> {
    return !!(await this.getEntropy())
  },
  async getEntropy(): Promise<string> {
    return get<string>('ENTROPY')
  },
  async auth(
    paymail: string,
    entropy: string
  ): Promise<boolean> {
    await set({ 'ENTROPY': entropy, 'PAYMAIL': paymail })
    return true
  },
  async logout(): Promise<boolean> {
    await clear()
    return true
  },
  async getIdentity(): Promise<{
    identityKey: PrivateKey;
    paymail: string;
  }> {
    const keys = getKeys(await this.getEntropy())
    return {
      identityKey: (await keys).identity,
      paymail: (await get<string>('PAYMAIL'))
    }
  },
  async getRunOwner(): Promise<PrivateKey> {
    const keys = await getKeys(await this.getEntropy())
    return keys.run
  },
  async getNextChange(): Promise<[string, number]> {
    const keys = await getKeys(await this.getEntropy())
    return [keys.changeAddress, 0]
  },
  async getNextAddress(): Promise<string> {
    const keys = await getKeys(await this.getEntropy())
    return keys.receiveAddress
  },
  async getNextBatonAddress(): Promise<string> {
    const keys = await getKeys(await this.getEntropy())
    return keys.batonAddress
  },
  async isRecentOwnChangeAddress(address: string): Promise<false | number> {
    const keys = await getKeys(await this.getEntropy())
    return address === keys.changeAddress ? 0 : false
  },
  async sign(sighash: Buffer, chain: number, index: number): Promise<Buffer> {
    const keys = await getKeys(await this.getEntropy());
    let privateKey: PrivateKey;
    if (chain === 0) {
      privateKey = keys.receive
    } else if (chain === -1) {
      throw new Error('Contact relayx')
    } else if (chain === -2) {
      throw new Error('Contact relayx')
    } else if (chain === -3) {
      privateKey = keys.run
    } else if (chain === -4) {
      privateKey = keys.baton
    } else {
      privateKey = keys.change
    }
    const pubkey = privateKey.toPublicKey().toBuffer();

    const [r, s] = sign(sighash, privateKey, "little");

    return serialize([
      Buffer.concat([
        toDer(r, s),
        new BufferWriter().writeUInt8(SIGHASH_ALL | SIGHASH_FORKID).concat()
      ]),
      pubkey
    ]);
  },
}

export default keys
