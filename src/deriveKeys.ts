import * as bip39 from '@scure/bip39';
import {HDKey} from '@scure/bip32';
import { hex } from "@scure/base";
import { wordlist } from '@scure/bip39/wordlists/english';
import PrivateKey from "@relayx/crypto/lib/bitcoin/PrivateKey";

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
  const seed = await bip39.mnemonicToSeed(bip39.entropyToMnemonic(hex.decode(entropy), wordlist), "")
  const hdkey = HDKey.fromMasterSeed(seed)!;
  const identity = new PrivateKey(hex.encode(hdkey.derive("m/0'/236'/0'/0/0").privateKey!));
  const receive = new PrivateKey( hex.encode(hdkey.derive("m/44'/236'/0'/0/0").privateKey!))
    const change = new PrivateKey(hex.encode( hdkey.derive("m/44'/236'/0'/1/0").privateKey!))
  const run = new PrivateKey(hex.encode( hdkey.derive("m/44'/236'/0'/2/0").privateKey!));
  const baton = new PrivateKey(hex.encode( hdkey.derive("m/44'/236'/0'/3/0").privateKey!));
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
