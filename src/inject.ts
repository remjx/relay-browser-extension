import uuid from 'uuid-random'
const messages: { [key: string]: (response: any) => void } = {};

function send<T = { error?: string }>(
    call: string,
    payload?: any
) {
    return new Promise<T>((resolve) => {
        const callId = uuid();
        messages[callId] = resolve;
        window.postMessage({ relay: "relay", call, params: { id: callId, payload } });
    });
}

window.addEventListener('message', (message: MessageEvent) => {
    if (message.data.relay !== "relay") {
        return;
    }

    if (message.data.call === "reply") {
        const id = message.data.params.id as string;
        if (messages.hasOwnProperty(id)) {
            const cb = messages[id];
            delete messages[id];
            cb(message.data.params.payload);
            return;
        }
        return;
    }
})

let authRedirectUrl: string | undefined = void 0

async function checkAndCall<T>(method: string, params: T): Promise<any> {
    const linked = await RelayOneClient.isLinked();
    if (!linked) {
        showSignupPopup(authRedirectUrl || window.location.toString())
        return new Promise(() => { });
    }
    const result = await send(method, params);
    if (result.error) {
        throw new Error(result.error);
    }
    return result;
}

async function unLinkedCall<T>(method: string, params: T): Promise<any> {
    const result = await send(method, params);
    if (result.error) {
        throw new Error(result.error);
    }
    return result;
}


const RelayOneClient = {
    p2p: true,
    extension: true,
    authRedirectUrl: (url: string) => {
        if (typeof url !== "string") {
            return false;
        }
        authRedirectUrl = url;
        return true;
    },

    send: async (props: any) => {
        if (typeof props === "string") {
            return checkAndCall("send", props);
        }
        const { onError, onPayment, onLoad, ...rest } = props;

        return checkAndCall("send", rest);
    },

    quote: async (props: any) => {
        const { onError, onPayment, onLoad, ...rest } = props;
        return unLinkedCall("quote", rest);
    },

    auth: async (paymail: string, entropy: string) => {
        return unLinkedCall("auth", { paymail, entropy });
    },

    getEntropy: async () => {
        return checkAndCall("get-entropy", {});
    },

    getNextAddress: async () => {
        console.warn("getNexAddress: private api do not use")
        return checkAndCall("get-next-address", {});
    },

    logout: async () => {
        return unLinkedCall("logout", {});
    },

    authBeta: async (withAllowance: boolean = false) => {
        return checkAndCall("request-auth2", { withAllowance });
    },

    isLinked: async () => {
        return unLinkedCall("is-linked", {});
    },

    isLegacy: async () => {
        return false;
    },

    isApp: () => {
        return false;
    },

    sign: async (message: string) => {
        return checkAndCall("sign", { message });
    },

    encrypt: async (message: string, paymail?: string, encoding?: string) => {
        return checkAndCall("encrypt", {
            message,
            paymail,
            encoding,
        });
    },

    decrypt: async (message: string) => {
        return checkAndCall("decrypt", { message });
    },

    getBalance: async () => {
        return checkAndCall("getBalance", {});
    },

    getBalance2: async () => {
        return checkAndCall("getBalance2", {});
    },

    errors: {
        isLowFunds(e: Error) {
            return !!e && e.message === "Low funds";
        },
    },
    alpha: {
        // Some people still use this to query balances
        run: {
            async getOwner() {
                return checkAndCall('run-owner', {})
            },
            async broadcast() {
                throw new Error('Not implemented')
            },
            async pay() {
                throw new Error('Not implemented')
            },
            async sign() {
                throw new Error('Not implemented')
            }
        }
    }
};

console.log("INJECTED");

(window as any)['relayone'] = RelayOneClient

const image = require('data-url:./logo-header.png')
const POPUP = `
<div style="
margin: 0 auto; padding: 20px; width: 300px; min-height: 250px; 
background: rgb(47, 59, 82);border-radius: 10px;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',sans-serif; display: flex; flex-direction: column;
justify-content: space-between;
box-sizing: border-box;
position: relative;
">
<img
  style="
    width: 120px;
    height: 20px;
    display: block;
    margin: 20px auto;
  "
  src="${image}"
  alt=""
/>
<div
  style="
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    boxSizing: content-box;
  "
  class="relay-one-close"
>
  <span
    style="
      display: block;
      box-sizing: content-box;
      cursor: pointer;
      background: rgb(101, 125, 149);
      border-radius: 50%;
      width: 16px;
      height: 16px;
      text-align: center;
      padding: 2px;
      font-size: 12px;
      color: rgb(17, 26, 44);
      line-height: 16px;
    "
  >
    ✕
  </span>
</div>
<div
  style="
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  "
>
  <div
    style="
      color: white;
      font-size: 16px;
      width: 197px;
      text-align: center;
    "
  >
    Please sign in with RelayX to enable spending
  </div>
  <a
    style="
      color: white;
      display: block;
      box-sizing: content-box;
      text-decoration: none;
      background-color: rgb(38, 105, 255);
      padding: 10px;
      border-radius: 5px;
      width: 130;
      margin-top: 10;
      text-align: center;
    "
    rel="noopener noreferrer"
    href="#"
  >
    Sign in
  </a>
</div>
<div style="margin: 0 auto; width: 200px"></div>
</div>
`

function showSignupPopup(redirectUrl: string) {
    const popup = document.createElement('div')
    popup.setAttribute('style', `
   display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color = rgb(0, 0, 0, 0.2);
  z-index = 99999;
    `)
    popup.innerHTML = POPUP;
    const a = popup.querySelector('a')!
    a.addEventListener('click', () => {
        window.location = `https://relayx.com/wallet/auth#${redirectUrl}`
    })
    const close = popup.querySelector('.relay-one-close')!
    close.addEventListener('click', () => {
        document.body.removeChild(popup)
    })

    document.body.appendChild(popup)
}