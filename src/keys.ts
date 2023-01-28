import ext from 'webextension-polyfill'
import PrivateKey from "@relayx/crypto/lib/bitcoin/PrivateKey";
import { entropyToMnemonic, mnemonicToSeed } from '@relayx/crypto/lib/bip39'
import HDKey from '@relayx/crypto/lib/hdkey'
import { sign, toDer } from '@relayx/crypto/lib/bitcoin/signature';
import {SIGHASH_ALL, SIGHASH_FORKID} from '@relayx/crypto/lib/bitcoin/sighash'
import { serialize } from '@relayx/crypto/lib/bitcoin/script';
import BufferWriter from '@relayx/crypto/lib/bitcoin/BufferWriter';
import { KeyStorage } from "@relayx/wallet/lib/auth";

const cache = new Map<string, KEYS>();

interface KEYS {
  identity: PrivateKey;
  receive: PrivateKey;
  change: PrivateKey;
  run: PrivateKey;
  baton: PrivateKey;
  receiveAddress: string;
  changeAddress: string;
  runAddress: string;
  batonAddress: string;
}

export async function getKeysFromEntropy(entropy: string): Promise<KEYS> {
  const seed = await mnemonicToSeed(entropyToMnemonic(entropy), "");
  const hdkey = HDKey.fromMasterSeed(seed);
  const identity = new PrivateKey((await hdkey.derive("m/0'/236'/0'/0/0")).privateKey.toString("hex"));
  const receive = new PrivateKey((await hdkey.derive("m/44'/236'/0'/0/0")).privateKey.toString("hex"))
  const change = new PrivateKey((await hdkey.derive("m/44'/236'/0'/1/0")).privateKey.toString("hex"))
  const run = new PrivateKey((await hdkey.derive("m/44'/236'/0'/2/0")).privateKey.toString("hex"));
  const baton = new PrivateKey((await hdkey.derive("m/44'/236'/0'/3/0")).privateKey.toString("hex"));
  return {
    identity,
    receive,
    change,
    run,
    baton,
    receiveAddress: receive.toPublicKey().toAddress().toString(),
    changeAddress: change.toPublicKey().toAddress().toString(),
    runAddress: run.toPublicKey().toAddress().toString(),
    batonAddress: baton.toPublicKey().toAddress().toString()
  };
}

export async function getKeys(entropy: string): Promise<KEYS> {
  if (!cache.has(entropy))
    cache.set(entropy, await getKeysFromEntropy(entropy));
  return cache.get(entropy)!;
}
const keys: KeyStorage = {
  async hasKeys(): Promise<boolean> {
    return !!(await this.getEntropy())
  },
  async getEntropy(): Promise<string> {
    const result = await ext.storage.local.get('ENTROPY')
    return result['ENTROPY']
  },
  async auth(
    paymail: string,
    entropy: string
  ): Promise<boolean> {
    await ext.storage.local.set({ 'ENTROPY': entropy, 'PAYMAIL': paymail })
    return true
  },
  async logout(): Promise<boolean> {
    await ext.storage.local.clear()
    return true
  },
  async getIdentity(): Promise<{
    identityKey: PrivateKey;
    paymail: string;
  }> {
    const keys = getKeys(await this.getEntropy())
    return {
      identityKey: (await keys).identity,
      paymail: (await ext.storage.local.get('PAYMAIL'))['PAYMAIL']
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