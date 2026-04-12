import { expect } from "chai"

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"
import { TextModel } from "@toad/appkit/TextModel"
import { TextField } from "@toad/viewkit/TextField"
import { NumberModel } from "@toad/appkit/NumberModel"
import { Fragment } from "toad.jsx/lib/jsx-runtime"

describe("view", function () {
    beforeEach(async function () {
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
                it("works when using JSX", async function () {
                    // const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                    const model = new TextModel("alpha")

                    document.body.appendChild(<TextField model={model} />)

                    let view = document.body.children[0]
                    expect(view.getAttribute("value")).to.equal("alpha")
                })
            })
        })
    })
})
