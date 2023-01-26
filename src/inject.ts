import {init} from '@relayx/frame-messaging/lib/frameMessaging'

const send = init(window, async () => {})!

async function checkAndCall<T>(method: string, params: T): Promise<any> {
    const linked = await RelayOneClient.isLinked();
    if (!linked) {
        await send("onboard", {})
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
    authRedirectUrl: (url: string) => {
        if (typeof url !== "string") {
            return false;
        }
        // RELAY_STATE.authRedirect = url;
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
};

console.log("INJECTED");

(window as any)['relayone'] = RelayOneClient
