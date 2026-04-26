import { NumberModel } from "@toad/appkit/NumberModel"
import { TextModel } from "@toad/appkit/TextModel"
import { Slider } from "@toad/viewkit/Slider"
import { TextField } from "@toad/viewkit/TextField"
import { expect } from "chai"
import { sleep } from "test/testlib"
import { replaceChildren } from "toad.jsx"

describe("view", function () {
    describe("slider", function () {
        describe("NumberModel", function () {
            xit("updates the html element when the model changes", async function () {
                let model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                replaceChildren(document.body, <Slider model={model} />)
                expect(getHTMLInputElement().value).to.equal("0.5")
                expect(model.signal.count).to.equal(1) // FIXME: in new test
            })

            xit("updates the model when the html element changes", function () {
                let model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                replaceChildren(document.body, <Slider model={model} />)
                expect(getHTMLInputElement().value).to.equal("0.5")
            })
        })
        describe("TextModel", function () {
            it("updates the html element when the model changes", function () {
                let model = new TextModel("alfa")
                replaceChildren(document.body, <TextField model={model} />)
                let input = getHTMLInputElement()
                expect(input.value).not.to.equal("bravo")
                model.value = "bravo"
                expect(input.value).to.equal("bravo")
            })

            it("updates the model when the html element changes", function () {
                let model = new TextModel("alfa")
                replaceChildren(document.body, <TextField model={model} />)
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
