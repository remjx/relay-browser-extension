import PrivateKey from "@relayx/crypto/lib/bitcoin/PrivateKey";
import { entropyToMnemonic, mnemonicToSeed } from '@relayx/crypto/lib/bip39'
import HDKey from '@relayx/crypto/lib/hdkey'
import { KeyStorage } from "@relayx/wallet/lib/auth";
import ext from 'webextension-polyfill'

const cache = new Map<string, KEYS>();

interface KEYS {
  identity: PrivateKey;
  run: PrivateKey;
}

export async function getKeysFromEntropy(entropy: string): Promise<KEYS> {
  const seed = await mnemonicToSeed(entropyToMnemonic(entropy), "");
  const hdkey = HDKey.fromMasterSeed(seed);

  return {
    identity: new PrivateKey((await hdkey.derive("m/0'/236'/0'/0/0")).privateKey.toString("hex")),
    run: new PrivateKey((await hdkey.derive("m/44'/236'/0'/2/0")).privateKey.toString("hex"))
  };
}

export async function getKeys(entropy: string): Promise<KEYS> {
  if (!cache.has(entropy))
    cache.set(entropy, await getKeysFromEntropy(entropy));
  return cache.get(entropy)!;
}
const keys: KeyStorage = {
  async hasKeys(): Promise<boolean> {
    return !!this.getEntropy()
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
  async getRunOwner(): Promise<Buffer> {
    const keys = getKeys(await this.getEntropy())
    return keys.run
  },
  async getNextChange(): Promise<[string, number]> { },
  async getNextAddress(): Promise<string> { },
  async getNextBatonAddress(): Promise<string> { },
  async isRecentOwnChangeAddress(address: string): Promise<false | number> { },
  async sign(scripthash: Buffer, chain: number, index: number): Promise<Buffer> {

  },
}

export default keys