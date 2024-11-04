import { expect } from "chai"
import { Fragment, TextField, TextModel, NumberModel, bindModel, unbind } from "@toad"

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

describe("view", function () {
    beforeEach(async function () {
        unbind()
        document.body.replaceChildren()
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    describe("Text", function () {
        describe("layout", function () {
            it("style.width", async function () {
                const model = new TextModel("A")
                document.body.replaceChildren(<TextField model={model} style={{ width: "16px" }} />)
            })
        })

        describe("NumberModel", function () {
            it("view and model are in sync", function () {
                const model = new NumberModel(42, { min: 0, max: 100, step: 1 })

                const content = (
                    <>
                        <TextField model={model} />
                    </>
                ) as Fragment
                content.replaceIn(document.body)
                const view = content[0] as TextField

                expect(view.value).to.equal(`${model.value}`)

                model.value = 17
                expect(view.value).to.equal(`${model.value}`)

                view.value = "81"
                expect(view.value).to.equal(`${model.value}`)
            })
            it("works when using JSX", function () {
                const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })

                document.body.appendChild(<TextField model={model} />)

                let view = document.body.children[0]
                expect(view.getAttribute("value")).to.equal("0.5")
            })
            describe("scrollwheel", function () {
                it("down", function () {
                    const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })

                    document.body.appendChild(<TextField model={model} />)
                    let view = document.body.children[0]
                    let input = view.shadowRoot!.children[0]

                    input.dispatchEvent(
                        new WheelEvent("wheel", {
                            deltaY: 1,
                        })
                    )

                    expect(view.getAttribute("value")).to.equal("0.4")
                })

                it("up", function () {
                    const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })

                    document.body.appendChild(<TextField model={model} />)
                    let view = document.body.children[0]
                    let input = view.shadowRoot!.children[0]

                    input.dispatchEvent(
                        new WheelEvent("wheel", {
                            deltaY: -1,
                        })
                    )

                    expect(view.getAttribute("value")).to.equal("0.6")
                })

            })
            // range
            // scroll wheel
        })
        describe("TextModel", function () {
            describe("initialize view from model", function () {
                it("does so when the model is defined before the view", function () {
                    const model = new TextModel("alpha")
                    bindModel("model", model)
                    document.body.innerHTML = "<tx-text model='model'></tx-text>"
                    const view = document.body.children[0]
                    // console.log(view.nodeName)

                    expect(view.getAttribute("value")).to.equal("alpha")
                })

                it("does so when the view is defined before the model", function () {
                    document.body.innerHTML = "<tx-text model='model'></tx-text>"

                    const model = new TextModel("alpha")
                    bindModel("model", model)

                    const view = document.body.children[0]
                    expect(view.getAttribute("value")).to.equal("alpha")
                })

                it("works when using JSX", async function () {
                    // const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                    const model = new TextModel("alpha")

                    document.body.appendChild(<TextField model={model} />)

                    let view = document.body.children[0]
                    expect(view.getAttribute("value")).to.equal("alpha")
                })
            })

            describe("on change sync data between model and view", function () {
                it("updates the html element when the model changes", function () {
                    let model = new TextModel("alpha")
                    bindModel("model", model)
                    document.body.innerHTML = "<tx-text model='model'></tx-text>"
                    let checkbox = document.body.children[0]
                    expect(checkbox.getAttribute("value")).to.equal("alpha")
                    model.value = "bravo"
                    expect(checkbox.getAttribute("value")).to.equal("bravo")
                })

                it("updates the model when the html element changes", function () {
                    let model = new TextModel("alpha")
                    bindModel("model", model)
                    document.body.innerHTML = "<tx-text model='model'></tx-text>"
                    let view = document.body.children[0] as TextField
                    expect(model.value).to.equal("alpha")
                    view.setAttribute("value", "bravo")
                    expect(model.value).to.equal("bravo")
                })
            })

            it("unregisters the view from the model when the view is removed from the dom", function () {
                let model = new TextModel("alfa")
                bindModel("text", model)

                expect(model.modified.count()).to.equal(0)

                document.body.innerHTML = "<tx-text model='text'></tx-text><tx-text model='text'></tx-text>"
                expect(model.modified.count()).to.equal(2)

                document.body.removeChild(document.body.children[0])
                expect(model.modified.count()).to.equal(1)

                document.body.innerHTML = ""
                expect(model.modified.count()).to.equal(0)
            })
        })
    })
})
