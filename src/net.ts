import {hex} from '@scure/base'
import { sha256sha256, signMessage } from './crypto'

import { WhiteList } from "@relayx/wallet/lib/api";
import { KeyStorage, NetworkApi } from "@relayx/wallet/lib/auth";
import { Utxo } from "@relayx/wallet/lib/utxo";
import { POST } from './http'
import keys from './keys'

async function getUtxos(): Promise<Utxo[]> {
  const data = await POST("/v1/utxo", {});
  if (data.code !== 0) {
    throw new Error("Failed to fetch utxo");
  }
  return data.data;
}

const net: NetworkApi = {
  async getUtxos(keys: KeyStorage) {
    if (!keys.hasKeys()) {
      return [];
    }
    return getUtxos();
  },
  async getExchangeRate(): Promise<number> {
    const url = "https://api.relayx.com/v1/common/rate";

    const res = await fetch(url);
    const response = await res.json();
    if (response.code !== 0) {
      throw new Error('Failed to fetch exchange rate')
    }
    return response.data.exchangeRate;
  },
  async getWhiteList(): Promise<WhiteList> {
    const data = await POST("/v1/common/whitelist", {});
    return data.data.whitelist;
  },
  async getSats(txid: string): Promise<number[]> {
    return (await (await fetch(`https://staging-backend.relayx.com/api/sats/${txid}`)).json()).data;
  },
  async broadcastTx(
    rawtx: string,
    refs: { paymail: string; ref: string }[]
  ): Promise<{ message?: { code?: number }; txid?: string }> {
    const txid = sha256sha256(hex.decode(rawtx)).reverse();

    const { identityKey, paymail } = await keys.getIdentity();

    const data = await POST(
      "/v1/broadcast",
      {
        rawtx,
        refs,
        meta: {
          sender: paymail,
          pubkey: identityKey.toPublicKey().toString(),
          signature: signMessage(txid, identityKey)
        }
      },
    );
    if (data.code !== 0) {
      throw new Error("Failed to broadcast");
    }
    return data.data;
  },
  async resolvePaymails(
    paymails: { paymail: string; satoshis: number; index: number }[]
  ): Promise<any> {
    return POST("/v1/paymail/resolve", paymails);
  }
}

export default net
