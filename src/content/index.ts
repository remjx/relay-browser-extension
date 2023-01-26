import * as messaging from '@relayx/frame-messaging/lib/frameMessaging'
import uuid from 'uuid-random';
import ext from 'webextension-polyfill'

const messages: { [key: string]: (payload: unknown) => unknown } = {}

if (shouldInject()) {
    injectScript(ext.runtime.getURL('inject.js'))

    const myPort = ext.runtime.connect({ name: 'relayone' });
    messaging.init(window, async (origin, method, params) => {
        console.log(origin, method, params)
        const id = uuid();
        myPort.postMessage({ method, params, id})
        return new Promise(resolve => {
            messages[id] = resolve;
        });
    })

    myPort.onMessage.addListener(data => {
        if (messages[data.id]) {
            messages[data.id](data.payload);
            delete messages[data.id];
        }
    });
}

function injectScript(file_path: string) {
    try {
        const container = document.head || document.documentElement;
        const script = document.createElement('script')
        script.setAttribute('type', 'text/javascript')
        script.setAttribute('async', 'fasle')
        script.setAttribute('src', file_path);
        console.log(container, script)
        container.insertBefore(script, container.children[0]);
        container.removeChild(script);
    } catch (e) {
        console.error('RelayOne: Provider injection failed.', e);
    }
}

// some MIT metamask checks
function shouldInject() {
    return doctypeCheck() && suffixCheck() && documentElementCheck() && !blockedDomainCheck();
}

function doctypeCheck() {
    const { doctype } = window.document;
    if (doctype) {
        return doctype.name === 'html';
    }
    return true;
}

function suffixCheck() {
    const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
    const currentUrl = window.location.pathname;
    for (let i = 0; i < prohibitedTypes.length; i++) {
        if (prohibitedTypes[i].test(currentUrl)) {
            return false;
        }
    }
    return true;
}

function documentElementCheck() {
    const documentElement = document.documentElement.nodeName;
    if (documentElement) {
        return documentElement.toLowerCase() === 'html';
    }
    return true;
}


function blockedDomainCheck() {
    const blockedDomains = [
        'uscourts.gov',
        'dropbox.com',
        'webbyawards.com',
        'cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html',
        'adyen.com',
        'gravityforms.com',
        'harbourair.com',
        'ani.gamer.com.tw',
        'blueskybooking.com',
        'sharefile.com',
    ];
    const currentUrl = window.location.href;
    let currentRegex;
    for (let i = 0; i < blockedDomains.length; i++) {
        const blockedDomain = blockedDomains[i].replace('.', '\\.');
        currentRegex = new RegExp(
            `(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`,
            'u',
        );
        if (!currentRegex.test(currentUrl)) {
            return true;
        }
    }
    return false;
}