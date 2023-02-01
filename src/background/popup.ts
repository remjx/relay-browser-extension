import ext from 'webextension-polyfill'
import uuid from 'uuid-random'
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

const WIDTH = 300;
const HEIGT = 300;

const pending: Record<string, any> = {}
const params: Record<string, Record<string, any>> = {}

export async function showPopup(name: string, p: Record<string, any>): Promise<boolean> {
    console.log('creating', name)
    const id = uuid()
    params[id] = { ...p, name }
    await mutex.acquire()
    const window = await ext.windows.getCurrent();
    const wnd = await ext.windows.create({
        url: 'background/popup.html#' + id,
        type: 'popup',
        width: WIDTH,
        height: HEIGT,
        top: window.top,
        left: window.width! - WIDTH,
    })
    wnd.alwaysOnTop = true;
    return new Promise((resolve, reject) => {
        pending[id] = [resolve, reject]
    })
}

ext.runtime.onConnect.addListener((remotePort) => {
    let id: string;
    if (remotePort.sender && remotePort.sender.tab && remotePort.sender.url && remotePort.name === 'popup') {
        const url = new URL(remotePort.sender.url);
        remotePort.onMessage.addListener((msg) => {
            id = msg.id
            console.log("popup received", msg, url.host)
            if (msg.type === 'init') {
                remotePort.postMessage({ ...params[id], type: 'init' })
            }
            if (msg.type === 'reply') {
                if (!pending[id]) {
                    return;
                }
                const [resolve, _] = pending[id];
                resolve(msg.payload)
            }
        });
        remotePort.onDisconnect.addListener(() => {
            console.log("prompt closed")
            if (pending[id]) {
                const [resolve, _] = pending[id]
                resolve(false)
            }
            mutex.release();
        })
    }
});