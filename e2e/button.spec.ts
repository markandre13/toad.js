import { describe, it } from "mocha"
import { expect, use } from "chai"
import { Browser, Page } from "puppeteer"

import { css, html } from '../src/util/lsx'

import {chaiMatchImageSnapshot}  from "./chaiMatchImageSnapshot"
import { getBrowser, sleep } from "./testlib"
use(chaiMatchImageSnapshot)

describe("button", function () {
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
        page.goto("http://localhost:8080/e2e/index.html?page=button", { waitUntil: 'domcontentloaded' })
    })

    afterEach(async function () {
        if (this.currentTest?.state !== "failed") {
            page.close()
        }
    })

    it("enabled/disabled; variant=default,primary,secondary,accent,negative", async function () {
        await sleep(500)
        const image = await page.screenshot()
        expect(image).toMatchImageSnapshot(this)
    })
})
