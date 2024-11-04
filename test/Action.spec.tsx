import { expect } from "chai"
import { action, Action, Button } from "@toad"

describe("action", function () {
    it("button created before action", function () {
        document.body.innerHTML = `<tx-button action="logon">Log on</tx-button>`

        let flag = false

        action("logon", () => {
            flag = true
        })

        getHTMLButtonElement().dispatchEvent(new Event("click"))

        expect(flag).to.equal(true)
    })

    it("action created before button", function () {
        let flag = false

        let logon = action("logon", () => {
            flag = true
        })

        document.body.innerHTML = `<tx-button action="logon">Log on</tx-button>`

        getHTMLButtonElement().dispatchEvent(new Event("click"))

        expect(flag).to.equal(true)
    })

    it("single action directly using JSX", async function () {
        let flag = false

        let logon = new Action(() => {
            flag = true
        })

        const view = <Button action={logon} />
        document.body.innerHTML = ""
        document.body.appendChild(view)
        getHTMLButtonElement().dispatchEvent(new Event("click"))

        expect(flag).to.equal(true)
    })

    it("two buttons for one action", function () {
        let flag = false

        let logon = action("logon", () => {
            flag = true
        })

        document.body.innerHTML = `<tx-button action="logon">Log on</tx-button><tx-button action="logon">Log on</tx-button>`

        getHTMLButtonElement(0).dispatchEvent(new Event("click"))
        expect(flag).to.equal(true)

        flag = false
        getHTMLButtonElement(1).dispatchEvent(new Event("click"))
        expect(flag).to.equal(true)
    })

    // not implemented yet
    // currently we create two Action objects but the ActionView takes only one
    it.skip("two actions for one button", function () {
        let flag0 = false
        let flag1 = false

        let logon0 = action("logon", () => {
            flag0 = true
        })

        let logon1 = action("logon", () => {
            flag1 = true
        })

        document.body.innerHTML = `<tx-button action="logon">Log on</tx-button>`
        getHTMLButtonElement().dispatchEvent(new Event("click"))

        console.log(`flag0 = ${flag0}`)
        console.log(`flag1 = ${flag1}`)

        expect(flag0).to.equal(true)
        expect(flag1).to.equal(true)
    })

    it.skip("button without action is disabled", function () {
        document.body.innerHTML = `<tx-button action="logon">Log on</tx-button>`

        let button = getHTMLButtonElement()

        expect(button.disabled).to.equal(true)
    })

    it("disable/enable button depending on action state", async function () {
        let logon = action("logon", () => {
            console.log("LOGON")
        })

        document.body.innerHTML = `<tx-button action="logon">Log on</tx-button>`

        const button = document.body.children[0] as Button
        expect(button.hasAttribute("disabled")).to.equal(false)

        logon.enabled = false
        expect(button.hasAttribute("disabled")).to.equal(true)

        logon.enabled = true
        expect(button.hasAttribute("disabled")).to.equal(false)
    })

    it.skip("disable/enable button depending on two action states", function () {
        let logon0 = action("logon", () => {
            console.log("LOGON")
        })
        let logon1 = action("logon", () => {
            console.log("LOGON")
        })

        document.body.innerHTML = `<tx-button action="logon">Log on</tx-button>`

        let button = getHTMLButtonElement()

        expect(button.disabled).to.equal(false)

        logon0.enabled = false
        expect(button.disabled).to.equal(false)

        logon1.enabled = false
        expect(button.disabled).to.equal(true)

        logon0.enabled = true
        expect(button.disabled).to.equal(false)
    })

    // FIXME: menu button has a different code base which needs also to be tested
})

function getHTMLButtonElement(index?: number): HTMLButtonElement {
    if (!index)
        index = 0
    let sr = document.body.children[index].shadowRoot
    if (!sr)
        throw Error(`Failed to get document.body.children[${index}].shadowRoot`)
    for (let child of sr.children) {
        if (child.tagName === "BUTTON")
            return child as HTMLButtonElement
    }
    throw Error(`Failed to find <button> in document.body.children[${index}].shadowRoot`)
}
