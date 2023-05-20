import { describe, it } from "mocha"
import { expect, use } from "chai"
import { Browser, Page } from "puppeteer"

import { chaiMatchImageSnapshot } from "./chaiMatchImageSnapshot"
import { getBrowser, sleep } from "./testlib"
use(chaiMatchImageSnapshot)

describe("form", function () {
    let browser: Browser
    let page: Page

    before(async function () {
        this.timeout(100000)
        browser = await getBrowser()
        const allPages = await browser.pages()
        allPages.forEach(page => {
            page.close()
        });
    })

    after(function () {
        browser.disconnect()
    })

    beforeEach(async function () {
        page = await browser.newPage()!
        page.setCacheEnabled(false)
        page.setViewport({ width: 640, height: 480, deviceScaleFactor: 1 })
    })

    afterEach(async function () {
        if (this.currentTest?.state !== "failed") {
            // page.close()
        }
    })

    describe("display", async function () {
        it("wide", async function () {
            page.goto("http://localhost:8080/e2e/form.wide.html", { waitUntil: 'domcontentloaded' })
            await sleep(500)
            const image = await page.screenshot()
            expect(image).toMatchImageSnapshot(this)
        })
        it("narrow", async function () {
            page.goto("http://localhost:8080/e2e/form.narrow.html", { waitUntil: 'domcontentloaded' })
            await sleep(500)
            const image = await page.screenshot()
            expect(image).toMatchImageSnapshot(this)
        })
    })
})
