import { expect } from "chai"
import { Signal, TextModel, TableAdapter, NumberModel, bind, unbind, action, Action } from "@toad"
import * as toadJSX from '@toad/util/jsx'

describe("toad.js", function () {

    function getHTMLInputElement(): HTMLInputElement {
        let sr = document.body.children[0].shadowRoot
        if (!sr)
            throw Error("fuck")
        for (let child of sr.children) {
            if (child.tagName === "INPUT")
                return child as HTMLInputElement
        }
        throw Error("fuck")
    }

    function getHTMLButtonElement(index?: number): HTMLButtonElement {
        if (!index)
            index = 0
        let sr = document.body.children[index].shadowRoot
        if (!sr)
            throw Error("fuck")
        for (let child of sr.children) {
            if (child.tagName === "BUTTON")
                return child as HTMLButtonElement
        }
        throw Error("fuck")
    }

    this.beforeEach(() => {
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""
    })

    describe("Signal", function () {

        it("works fine", function () {
            let signal = new Signal()
            let objectA = {}, objectB = {}, a = 0, b = 0

            expect(signal.count()).to.equal(0)

            signal.add(() => { ++a }, objectA)

            expect(signal.count()).to.equal(1)

            expect(a).to.equal(0)
            signal.trigger()
            expect(a).to.equal(1)

            signal.add(() => { a += 10 }, objectA)
            signal.add(() => { ++b }, objectB)
            expect(signal.count()).to.equal(3)

            expect(a).to.equal(1)
            expect(b).to.equal(0)
            signal.trigger()
            expect(a).to.equal(12)
            expect(b).to.equal(1)

            signal.remove(objectA)
            expect(signal.count()).to.equal(1)

            expect(a).to.equal(12)
            expect(b).to.equal(1)
            signal.trigger()
            expect(a).to.equal(12)
            expect(b).to.equal(2)

            signal.remove(objectB)
            expect(signal.count()).to.equal(0)
        })
    })

    describe("action", function () {
        it("button created before action", function () {
            document.body.innerHTML = `<toad-button action="logon">Log on</toad-button>`

            let flag = false

            let logon = action("logon", () => {
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

            document.body.innerHTML = `<toad-button action="logon">Log on</toad-button>`

            getHTMLButtonElement().dispatchEvent(new Event("click"))

            expect(flag).to.equal(true)
        })

        it("single action directly using JSX", async function () {
            let flag = false

            let logon = new Action(undefined, "")
            logon.signal.add(() => {
                flag = true
            })

            const view = <toad-button action={logon} />
            document.body.appendChild(view)
            getHTMLButtonElement().dispatchEvent(new Event("click"))

            expect(flag).to.equal(true)
        })

        it("two buttons for one action", function () {
            let flag = false

            let logon = action("logon", () => {
                flag = true
            })

            document.body.innerHTML = `<toad-button action="logon">Log on</toad-button><toad-button action="logon">Log on</toad-button>`

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

            document.body.innerHTML = `<toad-button action="logon">Log on</toad-button>`
            getHTMLButtonElement().dispatchEvent(new Event("click"))

            console.log(`flag0 = ${flag0}`)
            console.log(`flag1 = ${flag1}`)

            expect(flag0).to.equal(true)
            expect(flag1).to.equal(true)
        })

        it.skip("button without action is disabled", function () {
            document.body.innerHTML = `<toad-button action="logon">Log on</toad-button>`

            let button = getHTMLButtonElement()

            expect(button.disabled).to.equal(true)
        })

        it("disable/enable button depending on action state", function () {
            let logon = action("logon", () => {
                console.log("LOGON")
            })

            document.body.innerHTML = `<toad-button action="logon">Log on</toad-button>`

            let button = getHTMLButtonElement()

            expect(button.disabled).to.equal(false)

            logon.enabled = false
            expect(button.disabled).to.equal(true)

            logon.enabled = true
            expect(button.disabled).to.equal(false)
        })

        it.skip("disable/enable button depending on two action states", function () {
            let logon0 = action("logon", () => {
                console.log("LOGON")
            })
            let logon1 = action("logon", () => {
                console.log("LOGON")
            })

            document.body.innerHTML = `<toad-button action="logon">Log on</toad-button>`

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

    describe("model view basics", function () {
        it("unregisters the view from the model when the view is removed from the dom", function () {
            let model = new TextModel("alfa")
            bind("text", model)

            expect(model.modified.count()).to.equal(0)

            document.body.innerHTML = "<toad-text model='text'></toad-text><toad-text model='text'></toad-text>"
            expect(model.modified.count()).to.equal(2)

            document.body.removeChild(document.body.children[0])
            expect(model.modified.count()).to.equal(1)

            document.body.innerHTML = ""
            expect(model.modified.count()).to.equal(0)
        })
    })

    describe("<toad-text> and TextModel", function () {

        describe("initialize view from model", function () {

            it("does so when the model is defined before the view", function () {
                const model = new TextModel("alfa")
                bind("text", model)
                document.body.innerHTML = "<toad-text model='text'></toad-text>"
                expect(getHTMLInputElement().value).to.equal("alfa")

                expect(model.modified.callbacks).to.be.an('array')
                if (!model.modified.callbacks)
                    throw Error("fuck")
                expect(model.modified.callbacks.length).to.equal(1) // FIXME: in new test
            })

            it("does so when the view is defined before the model", function () {
                document.body.innerHTML = "<toad-text model='text'></toad-text>"
                const model = new TextModel("bravo")
                bind("text", model)
                expect(getHTMLInputElement().value).to.equal("bravo")
            })

            it("directly using JSX", async function () {
                const model = new TextModel("bravo")
                const view = <toad-text model={model} />
                document.body.appendChild(view)
                expect(getHTMLInputElement().value).to.equal("bravo")
            })
        })

        describe("on change sync data between model and view", function () {

            it("updates the html element when the model changes", function () {
                let model = new TextModel("alfa")
                bind("text", model)
                document.body.innerHTML = "<toad-text model='text'></toad-text>"
                let input = getHTMLInputElement()
                expect(input.value).not.to.equal("bravo")
                model.value = "bravo"
                expect(input.value).to.equal("bravo")
            })

            it("updates the model when the html element changes", function () {
                let model = new TextModel("alfa")
                bind("text", model)
                document.body.innerHTML = "<toad-text model='text'></toad-text>"
                let input = getHTMLInputElement()
                expect(model.value).not.to.equal("charly")
                input.value = "charly"
                input.dispatchEvent(new Event("input"))
                expect(model.value).to.equal("charly")
            })
        })
    })

    describe("<toad-slider> and NumberModel", function () {

        describe("initialize view from model", function () {

            it("does so when the model is defined before the view", function () {
                let model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                bind("number", model)
                document.body.innerHTML = "<toad-slider model='number'></toad-slider>"
                expect(getHTMLInputElement().value).to.equal("0.5")

                expect(model.modified.callbacks).to.be.an('array')
                if (!model.modified.callbacks)
                    throw Error("fuck")
                expect(model.modified.callbacks.length).to.equal(1) // FIXME: in new test
            })

            it("does so when the view is defined before the model", function () {
                document.body.innerHTML = "<toad-slider model='number'></toad-slider>"
                let model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                bind("number", model)
                expect(getHTMLInputElement().value).to.equal("0.5")
            })

            it("directly using JSX", async function () {
                const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                const view = <toad-slider model={model} />
                document.body.appendChild(view)
                expect(getHTMLInputElement().value).to.equal("0.5")
            })

        })

        describe("on change sync data between model and view", function () {

            it("updates the html element when the model changes", function () {
                let model = new TextModel("alfa")
                bind("text", model)
                document.body.innerHTML = "<toad-text model='text'></toad-text>"
                let input = getHTMLInputElement()
                expect(input.value).not.to.equal("bravo")
                model.value = "bravo"
                expect(input.value).to.equal("bravo")
            })

            it("updates the model when the html element changes", function () {
                let model = new TextModel("alfa")
                bind("text", model)
                document.body.innerHTML = "<toad-text model='text'></toad-text>"
                let input = getHTMLInputElement()
                expect(model.value).not.to.equal("charly")
                input.value = "charly"
                input.dispatchEvent(new Event("input"))
                expect(model.value).to.equal("charly")
            })
        })
    })
})
