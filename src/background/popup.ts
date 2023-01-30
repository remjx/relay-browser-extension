import ext from 'webextension-polyfill'
import uuid from 'uuid-random'
const WIDTH = 300;
const HEIGT = 300;

const pending: Record<string, any> = {}

export async function showPopup(name: string): Promise<boolean> {
    console.log('creating', name)
    const id = uuid()
    const window = await ext.windows.getCurrent();
    const wnd = await ext.windows.create({
        url: 'background/popup.html#'+id,
        type: 'popup',
        width: WIDTH,
        height: HEIGT,
        top: window.top,
        left: window.width! - WIDTH,
    })
    wnd.alwaysOnTop = true;
    return new Promise(resolve => {
        pending[id] = resolve
    })
}

ext.runtime.onConnect.addListener((remotePort) => {
    if (remotePort.sender && remotePort.sender.tab && remotePort.sender.url && remotePort.name === 'popup') {
      const url = new URL(remotePort.sender.url);
      remotePort.onMessage.addListener(async (msg) => {
        console.log("popup received", msg, url.host)
        pending[msg.id](msg.payload)
      });
    }
});