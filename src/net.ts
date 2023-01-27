import { reverseBuffer } from "@relayx/crypto/lib/bitcoin/BufferWriter";
import { sha256sha256 } from '@relayx/crypto/lib/bitcoin/crypto'
import { sign } from "@relayx/crypto/lib/bitcoin/signature";
import { sign as signMessage } from "@relayx/crypto/lib/bitcoin/message";

import { WhiteList } from "@relayx/wallet/lib/api";
import { KeyStorage, NetworkApi } from "@relayx/wallet/lib/auth";
import { POST } from './http'
import keys from './keys'

const net: NetworkApi = {
  async getUtxos(keys: KeyStorage) {
    if (!keys.hasKeys()) {
      return [];
    }
    return []
    // return getUtxos(keys);
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
    const txid = reverseBuffer(sha256sha256(Buffer.from(rawtx, "hex")));

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