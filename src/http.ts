import { getSignedToken } from "@relayx/wallet/lib/auth";
import keys from './keys'
import permissions from "./permissions";

const API_URL = 'https://api.relayx.com'

export async function POST<T>(
  url: string,
  params: T,
): Promise<any> {
  const result = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: await getSignedToken("relayx.io", keys, permissions)
    },
    body:
      params === null
        ? void 0
        : typeof params === "string"
          ? params
          : JSON.stringify(params)
  });
  const data = await result.json();
  return data ;
}
