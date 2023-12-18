import { expect } from "@esm-bundle/chai"
import { bindModel as bind, TextModel, unbind } from "@toad"
import { OptionModel } from "@toad/model/OptionModel"
import { EnumModel } from "@toad/model/EnumModel"
import { Select, ComboBox } from "@toad/view/Select"

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

enum Enum {
    A,
    B,
    C,
}

const htmlPopupMenu = `
<tx-select model='option'>
    <option value="A">a</option>
    <option value="B">b</option>
    <option value="C">c</option>
</tx-select>`

const htmlComboBox = `<tx-select model='option' text='text'>
    <option value="A">a</option>
    <option value="B">b</option>
    <option value="C">c</option>
</tx-select>`

describe("Select", function () {
    beforeEach(async function () {
        unbind()
        document.body.replaceChildren()
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    xit("can display options", function () {
        enum IMAC {
            BONDI,
            BLUEBERRY,
            GRAPE,
            STRAYBERRY,
            TANGERINE,
            LIME,
        }

        // note: referencing the document's stylesheet in the label won't work
        const model0 = new OptionModel(IMAC.BONDI, [
            [IMAC.BONDI, <div style={{ color: "#FFFFFF", background: "#0095b6" }}>Bondi</div>],
            [IMAC.BLUEBERRY, <div style={{ color: "#FFFFFF", background: "#4169E1" }}>Blueberry</div>],
            [IMAC.GRAPE, <div style={{ color: "#FFFFFF", background: "#421C52" }}>Grape</div>],
            [IMAC.STRAYBERRY, <div style={{ color: "#000000", background: "#fe2c54" }}>Strawberry</div>],
            [IMAC.TANGERINE, <div style={{ color: "#000000", background: "#f28500" }}>Tangerine</div>],
            [IMAC.LIME, <div style={{ color: "#000000", background: "#32cd32" }}>Lime</div>],
        ])

        const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
        const text = new TextModel()
        document.body.replaceChildren(<ComboBox model={model} text={text} />, <Select model={model0} />)
    })

    // // FIXME: this is actually: signal: clear busy flag after exception
    // it("be able to change the model after an exception", function() {
    //     const model = new OptionModel<string>()
    //     model.add("A", "a")
    //     model.add("B", "b")

    //     const list: string[] = []
    //     model.modified.add((a) => {
    //         list.push(a)
    //         if (a === "A") {
    //             throw Error("yikes")
    //         }
    //     })

    //     try {
    //         model.value = "a"
    //     }
    //     catch(e) {
    //         list.push("fail")
    //     }
    //     model.value = "b"
    //     expect(list).to.deep.equal(["A", "fail", "B"])
    // })

    // it.only("select should switch value even when trigger threw exception", function() {

    // })

    describe("select", function () {
        describe("Select", function () {
            it("updates the html element when the model changes", function () {
                const option = new OptionModel(Enum.A, [
                    [Enum.A, "a"],
                    [Enum.B, "b"],
                    [Enum.C, "c"],
                ])
                document.body.replaceChildren(<Select model={option} />)
                expect(innerText()).to.equal("a")

                option.value = Enum.B

                expect(innerText()).to.equal("b")
            })

            it("updates the html element when the mapping changes", function () {
                const option = new OptionModel(Enum.B, [
                    [Enum.A, "a"],
                    [Enum.B, "b"],
                    [Enum.C, "c"],
                ])
                document.body.replaceChildren(<Select model={option} />)
                expect(innerText()).to.equal("b")

                option.setMapping([
                    [Enum.C, "Charly"],
                    [Enum.A, "Alice"],
                    [Enum.B, "Bob"],
                ])

                expect(innerText()).to.equal("Bob")
            })

            it("updates the model when the html element changes", function () {
                const option = new OptionModel("Up", ["Up", "Down"])
                document.body.replaceChildren(<Select model={option} />)
                expect(innerText()).to.equal("Up")

                let btn = button()
                btn.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1 }))
                btn.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }))
                document.activeElement!.shadowRoot!.activeElement!.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "ArrowDown" })
                )
                expect(innerText()).to.equal("Down")
            })
        })

        // describe("ComboBox", function () {

            //     describe("OptionModel & TextModel", function() {
            //         it("updates the html element when the option model changes", function() {
            //             const option = new EnumModel<Enum>(Enum, Enum.A)
            //             bind("option", option)
            //             const text = new TextModel()
            //             bind("text", text)

            //             document.body.innerHTML = htmlComboBox
            //             let input = getHTMLInputElement()
            //             expect(input.value).to.equal("a")
            //             expect(text.value).to.equal("a")

            //             option.value = Enum.B

            //             expect(input.value).to.equal("b")
            //             expect(text.value).to.equal("b")
            //         })
            //         it("updates the html element when the text model changes")

            //         it("updates the model when the html element changes", function () {
            //             const option = new EnumModel<Enum>(Enum, Enum.A)
            //             bind("option", option)
            //             const text = new TextModel()
            //             bind("text", text)

            //             document.body.innerHTML = htmlComboBox
            //             expect(text.value).to.equal("a")

            //             let button = getHTMLButtonElement()
            //             button.dispatchEvent(new PointerEvent("pointerdown", {pointerId: 1}))
            //             button.dispatchEvent(new PointerEvent("pointerup", {pointerId: 1}))
            //             document.activeElement!.shadowRoot!.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}))

            //             expect(option.value).to.equal(Enum.B)
            //             expect(text.value).to.equal("b")

            //         })
        // })
    })
})

function innerText() {
    const select = document.body.children[0] as Select<Enum>
    const span = select.shadowRoot!.children[0].children[0] as HTMLSpanElement
    return span.innerText
}

function button() {
    const select = document.body.children[0] as Select<Enum>
    return select.shadowRoot!.children[1] as HTMLButtonElement
}