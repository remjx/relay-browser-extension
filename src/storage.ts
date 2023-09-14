import ext from 'webextension-polyfill'

export async function get<T>(key: string, def?: T): Promise<T> {
    const result = await ext.storage.local.get(key)
    return result[key] || def
}

export async function set(values: Record<string, any>): Promise<void> {
    return await ext.storage.local.set(values)
}

export async function clear(): Promise<void> {
  return await ext.storage.local.clear()
}
