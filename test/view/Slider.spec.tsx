import { expect } from "@esm-bundle/chai"
import { Slider, NumberModel, TextModel, bindModel as bind } from "@toad"
import { sleep } from "test/testlib"

describe("view", function () {
    describe("slider", function () {
        describe("NumberModel", function () {
            it("works when the model is defined before the view", async function () {
                let model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                bind("number", model)
                document.body.innerHTML = "<tx-slider model='number'></tx-slider>"
                expect(getHTMLInputElement().value).to.equal("0.5")

                expect(model.modified.callbacks).to.be.an("array")
                if (!model.modified.callbacks) throw Error("yikes")
                expect(model.modified.callbacks.length).to.equal(1) // FIXME: in new test
            })

            it("works when the view is defined before the model", function () {
                document.body.innerHTML = "<tx-slider model='number'></tx-slider>"
                let model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                bind("number", model)
                expect(getHTMLInputElement().value).to.equal("0.5")
            })

            it("works when using JSX", async function () {
                document.body.innerHTML = ""
                const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                const view = <Slider model={model} />
                document.body.appendChild(view)
                expect(getHTMLInputElement().value).to.equal("0.5")
            })
        })
        describe("TextModel", function () {
            it("updates the html element when the model changes", function () {
                let model = new TextModel("alfa")
                bind("text", model)
                document.body.innerHTML = "<tx-text model='text'></tx-text>"
                let input = getHTMLInputElement()
                expect(input.value).not.to.equal("bravo")
                model.value = "bravo"
                expect(input.value).to.equal("bravo")
            })

            it("updates the model when the html element changes", function () {
                let model = new TextModel("alfa")
                bind("text", model)
                document.body.innerHTML = "<tx-text model='text'></tx-text>"
                let input = getHTMLInputElement()
                expect(model.value).not.to.equal("charly")
                input.value = "charly"
                input.dispatchEvent(new Event("input"))
                expect(model.value).to.equal("charly")
            })
        })
    })
})

function getHTMLInputElement(): HTMLInputElement {
    const sr = document.body.children[0].shadowRoot?.querySelector("input")
    if (!sr) {
        throw Error("yikes")
    }
    return sr
}
