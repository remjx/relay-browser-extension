declare global {
    var storageMock: Record<string, any>;
}
export function get(key: string) {
    return storageMock[key] || null;
}
export function set(values: Record<string, any>) {
    for (const prop in storageMock) {
        delete storageMock[prop];
    }
    for (const prop in values) {
        storageMock[prop] = values[prop];
    }
}
export function clear() {
    for (const prop in storageMock) {
        delete storageMock[prop];
    }
};
