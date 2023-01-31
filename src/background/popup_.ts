import ext from 'webextension-polyfill'

document.addEventListener('DOMContentLoaded', () => {
    const myPort = ext.runtime.connect({ name: 'popup' });
    let intiialised = false
    myPort.onMessage.addListener((msg) => {
        const { type, name, ...rest } = msg
        console.log('popup_', msg)
        if (type === 'init') {
            if (intiialised) {
                myPort.postMessage({ id: window.location.hash.slice(1), payload: false })
                return;
            }
            intiialised = true
            // render prompt
            const el = document.createElement('div');
            if (name === 'ask-authorization') {
                el.innerHTML = `
                <div>
                    <b></b> wants to:
                </div>
                <div class="list">
                - Read your paymail.<br />
                - Spend up to 0.1 BSV.<br />
                - See your balance.
                </div>`
                const b = el.querySelector('b')!
                b.innerText = rest.origin
            }
            if (name === 'ask-send') {
                el.innerHTML = "<b></b> wants to spend <span></span> BSV."
                const b = el.querySelector('b')!
                b.innerText = rest.origin
                const span = el.querySelector('span')!
                span.innerText = rest.satoshis.toString()
            }
            if (name === 'ask-allowance') {
                el.innerHTML = "Allow <b></b> to spend up to 0.1 BSV on your behalf."
                const b = el.querySelector('b')!
                b.innerText = rest.origin
            }
            if (name === 'ask-run') {
                if (rest.metadata && rest.metadata.name) {
                    el.innerHTML = `
                      Allow <b></b> to manage your
                      <div style="margin-top: 8px;  overflow: hidden">
                      <a
                        style="color: white; text-decoration: none"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <b><span>
                          </span></b>
                        </a>
                      </div>
                      <div
                        style="font-size: 12px; line-height: 16px">
                      <div
                        style="text-align: center">
                        This enables the site to:
                      </div>
                      <ul
                        style="margin: 8px 0px"
                      >
                        <li>Move any amount of your token</li>
                      </ul>
                    </div>
                    <div style="text-align: center; font-size: 12; color: #f3a12d; border-radius: 4px; margin-bottom: 8px; background: #111a2c">
                      Warning: only do this for sites you trust
                    </div>
                    `
                    const b = el.querySelector('b')!
                    b.innerText = rest.origin
                    const span = el.querySelector('span')!
                    span.innerText = rest.metadata.name
                    const a = el.querySelector('a')!
                    a.href = `https://relayx.com/market/${rest.metadata.origin}`

                } else {
                    el.innerHTML = `
                      Allow <b></b> to manage your tokens.
                    <div
                      style="font-size: 12px; line-height: 16px">
                     >
                       <div style="text-align: center">
                        This enables the site to:
                       </div>
                       <ul style="margin: 8px 0px">
                        <li>Move any amount of your token</li>
                       </ul>
                    </div>
                    <div style="text-align: center; font-size: 12; color: #f3a12d; border-radius: 4px; margin-bottom: 8px; background: #111a2c">
                      Warning: only do this for sites you trust
                    </div>
                    `
                    const b = el.querySelector('b')!
                    b.innerText = rest.origin
                }
            }
            if (name === 'ask-bitcom') {
                el.innerHTML = '<b></b> wants to sign messages for app "<span></span>".'
                const b = el.querySelector('b')!
                b.innerText = rest.origin
                const span = el.querySelector('span')!
                span.innerText = rest.app
            }
            const bodyDiv = document.querySelector('.body')!
            bodyDiv.insertBefore(el, bodyDiv.firstChild)
            document.getElementById('cancel')?.addEventListener('click', () => {
                myPort.postMessage({ id: window.location.hash.slice(1), payload: false, type: 'reply' })
                window.close()
            })
            document.getElementById('approve')?.addEventListener('click', () => {
                myPort.postMessage({ id: window.location.hash.slice(1), payload: true, type: 'reply' })
                window.close()
            })

        }
    })
    myPort.postMessage({ id: window.location.hash.slice(1), type: 'init' })

})