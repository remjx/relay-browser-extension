import ext from 'webextension-polyfill'
const myPort = ext.runtime.connect({ name: 'popup' });
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cancel')?.addEventListener('click', () => {
        myPort.postMessage({ id: window.location.hash.slice(1), payload: false })
    })
    document.getElementById('approve')?.addEventListener('click', () => {
        myPort.postMessage({ id: window.location.hash.slice(1), payload: true })
    })
})