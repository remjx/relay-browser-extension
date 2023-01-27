import ext from 'webextension-polyfill'
import {callWalletMethod} from '@relayx/wallet/lib/index'

ext.browserAction.onClicked.addListener(() => {
    ext.tabs.create({
        active: true,
        url: 'https://relayx.com/wallet'
    })
})
ext.runtime.onConnect.addListener((remotePort) => {
    console.log('remotePort', remotePort);
    if (remotePort.sender && remotePort.sender.tab && remotePort.sender.url) {
      const url = new URL(remotePort.sender.url);
      remotePort.onMessage.addListener(async (msg) => {
        console.log("Backgroud received", msg, url.host)
        const response = await callWalletMethod(msg.method, msg.params || {}, origin, getKeys(), net, permissions);

        remotePort.postMessage({id: msg.id, payload: response})
      });
    }
  
});