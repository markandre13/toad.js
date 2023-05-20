import { spawn } from "child_process"
import { Browser, connect, executablePath, Page } from "puppeteer"

export async function getBrowser(): Promise<Browser> {
    // We can start Chrome as a separate process and hence reuse it.

    // /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=21222
    const chromeDebugPort = 21222
    let browser
    let flagLaunched = false
    let connectTries = 0

    while (true) {
        try {
            browser = await connect({ browserURL: `http://127.0.0.1:${chromeDebugPort}` })
        } catch (e) {
            if (flagLaunched === false) {
                console.log(`launching chrome '${executablePath()}'`)
                spawn(executablePath(), [
                    `--remote-debugging-port=${chromeDebugPort}`,
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins',
                    '--disable-site-isolation-trials',
                    '--disable-features=BlockInsecurePrivateNetworkRequests',
                    '--no-sandbox',
                    // '--disable-setuid-sandbox'
                ], {
                    detached: true,
                })
                flagLaunched = true
            }
            await sleep(1000)
            ++connectTries
            if (connectTries > 10) {
                console.log("failed to connect to chrome")
                process.exit()
            }
            continue
        }
        break
    }
    return browser
}

export function sleep(milliseconds: number = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}
