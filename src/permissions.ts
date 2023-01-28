import { Permissions } from "@relayx/wallet/lib/auth"

const permissions: Permissions = {
  // Prompts if no authorization
  async getAuthorization(origin: string): Promise<number> {
    return +new Date()
  },
  async askSend(origing: string, value: number): Promise<boolean> {
    return true
  },
  async askAllowance(origing: string): Promise<boolean> {
    return true
  },
  async askRun(origin: string, metadata: RunClsMetadata | null): Promise<boolean> {
    return true
  },
  async askBitcom(origin: string, app: string): Promise<boolean> {
    return true
  },
  async getAllowance(origin: string): Promise<number> {
    return 100000000000000
  },
  async setAllowance(origin: string, sats: number): Promise<any> {
    return
  },
  async isTrusted(origin: string): Promise<boolean> {
    return true
  }
}
export default permissions
