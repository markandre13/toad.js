import { describe, it } from "mocha"
import { expect, use } from "chai"
import { spawn } from "child_process"
import { Browser, connect, executablePath, Page } from "puppeteer"

import { css, html } from '../src/util/lsx'

import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { basename, dirname } from "path"

declare global {
    namespace Chai {
        interface Assertion {
            toMatchImageSnapshot(expected: Mocha.Context): Assertion
        }
        interface Assert {
            toMatchImageSnapshot(val: Buffer, exp: Mocha.Context, msg?: string): void
        }
    }
}

use(chaiMatchImageSnapshot)
function chaiMatchImageSnapshot(chai: Chai.ChaiStatic, utils: Chai.ChaiUtils) {
    var Assertion = chai.Assertion
    var assertionPrototype = Assertion.prototype
    Assertion.addMethod('toMatchImageSnapshot', function (expected) {
        var actual = utils.flag(this, 'object')
        var showDiff = chai.config.showDiff

        assertionPrototype.assert.call(this,
            compare(expected, actual),
            'expected snapshot to match image',
            'expected snapshot not to match image',
            // 'expected #{act} to match image #{exp}',
            // 'expected #{act} to not match image #{exp}',
            expected,
            actual,
            showDiff
        )
    })

    chai.assert.toMatchImageSnapshot = function (val, exp, msg) {
        new chai.Assertion(val, msg).to.be.toMatchImageSnapshot(exp)
    }

    function compare(expected: Mocha.Context, actual: Buffer): boolean {
        const testFile = expected.test!.file!

        let dirName = dirname(testFile)
        dirName += `/__image_snapshots__`

        let imageFile = dirName
        imageFile += `/`
        imageFile += basename(testFile).replaceAll(".", "-")
        imageFile += "-"
        imageFile += fullTestName(expected.test!).replaceAll(" ", "-")
        imageFile += "-1-snap.png"

        if (!existsSync(imageFile)) {
            if (!existsSync(dirName)) {
                mkdirSync(dirName)
            }
            writeFileSync(imageFile, actual)
            return true
        }

        const expectedImg = PNG.sync.read(readFileSync(imageFile))
        const actualImg = PNG.sync.read(actual)
        const { width, height } = actualImg
        const diff = new PNG({ width, height })
        const numberOfMismatchedPixels = pixelmatch(expectedImg.data, actualImg.data, diff.data, width, height, { threshold: 0.1 })

        return numberOfMismatchedPixels === 0
    }

    function fullTestName(t: Mocha.Runnable | Mocha.Suite | undefined): string {
        if (t === undefined) {
            return ""
        }
        const pt = fullTestName(t.parent)
        if (pt.length === 0) {
            return t.title
        }
        return pt + "-" + t.title
    }
}

describe("section one", function () {
    let browser: Browser
    let page: Page

    before(async function () {
        this.timeout(100000)
        browser = await getBrowser()
    })

    after(function () {
        browser.disconnect()
    })

    beforeEach(async function () {
        page = await browser.newPage()!
        page.setCacheEnabled(false)
        page.setViewport({ width: 640, height: 480, deviceScaleFactor: 1 })
        page.goto("http://localhost:8080/e2e/index.html", { waitUntil: 'domcontentloaded' })
    })

    afterEach(async function () {
        if (this.currentTest?.state !== "failed") {
            page.close()
        }
    })

    it("foo bar", async function () {
        // if i'd run my own server, i could serve my own content
        // for the code side.... bundle all foo.code.ts files?
        // the html could then refer to the models within

        await sleep(20)
        // page.setContent(
        //     html`<!doctype html>
        //     <html>
            
        //     <head>
        //         <meta charset="utf-8">         
        //         <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        //         <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1, user-scalable=yes">
        //         <link rel="stylesheet" type="text/css"
        //             href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,500,600&subset=latin" />
        //         <link rel="stylesheet" type="text/css"
        //             href="https://fonts.googleapis.com/css?family=IBM+Plex+Mono:400&subset=latin" />
        //         <link rel="stylesheet" type="text/css" href="/style/tx-static.css" />
        //         <link rel="stylesheet" type="text/css" href="/style/tx-dark.css" />
        //         <link rel="stylesheet" type="text/css" href="/style/tx.css" />
        //         <script type="application/javascript" src="/polyfill/webcomponents-hi-sd-ce.js"></script>
        //         <script type="module" src="/docs/main.js"></script>
        //     </head>
        //     <body>
        //         <tx-button>Hello</tx-button>
        //     </body>
        //     </html>`)
        const image = await page.screenshot()
        expect(image).toMatchImageSnapshot(this)
    })
})

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
                    '--disable-setuid-sandbox'
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

function sleep(milliseconds: number = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}
