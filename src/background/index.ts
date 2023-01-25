import ext from 'webextension-polyfill'

ext.browserAction.onClicked.addListener(() => {
    ext.tabs.create({
        active: true,
        url: 'https://relayx.com/wallet'
    })

})