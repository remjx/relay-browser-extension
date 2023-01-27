import { Permissions } from "@relayx/wallet/lib/auth"

const permissions: Permissions = {
  // Prompts if no authorization
  async getAuthorization(origin: string): Promise<number> {
    return +new Date()
  },
  async askSend(origing: string, value: number): Promise<boolean> {
    return false
  },
  async askAllowance(origing: string): Promise<boolean> {
    return false
  },
  async askRun(origin: string, metadata: RunClsMetadata | null): Promise<boolean> {
    return false
  },
  async askBitcom(origin: string, app: string): Promise<boolean> {
    return false
  },
  async getAllowance(origin: string): Promise<number> {
    return 0
  },
  async setAllowance(origin: string, sats: number): Promise<any> {
    return
  },
  async isTrusted(origin: string): Promise<boolean> {
    return false
  }
}
export default permissions
