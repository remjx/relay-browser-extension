import { Permissions } from "@relayx/wallet/lib/auth"
import { RunClsMetadata } from "@relayx/wallet/lib/types";
import { get, set } from './storage'
import { showPopup } from "./background/popup";

const RELAY_ORIGINS = [
  "relayx.io",
  "relayx.com",
  "www.relayx.com",
  "staging.relayx.com",
  "tamm.relayx.com",
  "swap.relayx.com",
  "bridge.relayx.com"
];

const permissions: Permissions = {
  // Prompts if no authorization
  async getAuthorization(origin: string): Promise<number> {
    if (~RELAY_ORIGINS.indexOf(origin)) {
      return +new Date();
    }
    const key = `A_${origin}`
    let date = await get<number>(key);

    if (!date) {
      const result = await showPopup("ask-authorization");
      if (result === true) {
        await set({ key: +new Date })
        return get<number>(key)
      }
    }

    return date;
  },
  async askSend(origin: string, satoshis: number): Promise<boolean> {
    if (~RELAY_ORIGINS.indexOf(origin)) {
      return true;
    }

    return await showPopup("ask-send", {
      origin,
      satoshis
    });
  },
  async askAllowance(origin: string): Promise<boolean> {
    const result = await showPopup('ask-allowance')
    const key = `AS_${origin}`
    if (result) {
      set({ [key]: 10000000 })
    }
    return result
  },
  async askRun(origin: string, metadata: RunClsMetadata | null): Promise<boolean> {
    const isTrusted = await this.isTrusted(origin);
    if (isTrusted) {
      return true;
    }
    return await showPopop( "ask-run", {
      origin,
      metadata
    });
  },
  async askBitcom(origin: string, app: string): Promise<boolean> {
    if (~RELAY_ORIGINS.indexOf(origin)) {
      return true;
    }
    const key = `AIP_APPROVE_${origin}:${app}`;
    let approved = await get<boolean>(key)
    if (!approved) {
      approved = await showPopup("ask-bitcom", {
        origin,
        app
      });
      if (approved) {
        set({ [key]: true })
      }
    }

    return !!approved;
  },
  async getAllowance(origin: string): Promise<number> {
    const key = `AS_${origin}`
    return get<number>(key, 0)
  },
  async setAllowance(origin: string, sats: number): Promise<any> {
    const key = `AS_${origin}`
    return set({ [key]: sats })
  },
  async isTrusted(origin: string): Promise<boolean> {
    return !!~RELAY_ORIGINS.indexOf(origin);
  }
}
export default permissions
