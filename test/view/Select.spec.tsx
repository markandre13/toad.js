import { expect } from '@esm-bundle/chai'
import { bindModel as bind, TextModel, unbind } from "@toad"
import { OptionModel } from '@toad/model/OptionModel'
import { EnumModel } from '@toad/model/EnumModel'
import { Select, ComboBox } from '@toad/view/Select'

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

enum Enum {
    A,
    B,
    C
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

    it("can display options", function () {

        enum IMAC {
            BONDI,
            BLUEBERRY,
            GRAPE,
            STRAYBERRY,
            TANGERINE,
            LIME
        }

        // note: referencing the document's stylesheet in the label won't work
        const model0 = new OptionModel(IMAC.BONDI, [
            [IMAC.BONDI, <div style={{color: "#FFFFFF", background: "#0095b6"}}>Bondi</div>],
            [IMAC.BLUEBERRY, <div style={{color: "#FFFFFF", background: "#4169E1"}}>Blueberry</div>],
            [IMAC.GRAPE, <div style={{color: "#FFFFFF", background: "#421C52"}}>Grape</div>],
            [IMAC.STRAYBERRY, <div style={{color: "#000000", background: "#fe2c54"}}>Strawberry</div>],
            [IMAC.TANGERINE, <div style={{color: "#000000", background: "#f28500"}}>Tangerine</div>],
            [IMAC.LIME, <div style={{color: "#000000", background: "#32cd32"}}>Lime</div>],
        ])

        const model = new OptionModel("Down", [
            "Up",
            "Down",
            "Left",
            "Right"
        ])
        const text = new TextModel()
        document.body.replaceChildren(
            <ComboBox model={model} text={text}/>,
            <Select model={model0}/>
        )
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

    // describe("select", function () {
    //     describe("OptionModel", function() {
    //         it("updates the html element when the model changes", function() {
    //             const option = new EnumModel<Enum>(Enum, Enum.A)
    //             bind("option", option)
    //             document.body.innerHTML = htmlPopupMenu
    //             let input = getHTMLInputElement()
    //             expect(input.value).to.equal("a")

    //             option.value = Enum.B
    //             expect(input.value).to.equal("b")
    //         })

    //         it("updates the model when the html element changes", function () {
    //             const option = new EnumModel<Enum>(Enum, Enum.A)
    //             bind("option", option)
    //             document.body.innerHTML = htmlPopupMenu

    //             let button = getHTMLButtonElement()
    //             button.dispatchEvent(new PointerEvent("pointerdown", {pointerId: 1}))
    //             button.dispatchEvent(new PointerEvent("pointerup", {pointerId: 1}))
    //             document.activeElement!.shadowRoot!.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}))

    //             expect(option.value).to.equal(Enum.B)
    //         })
    //     })

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
    //     })


    // })
})

function getHTMLInputElement(): HTMLInputElement {
    let sr = document.body.children[0].shadowRoot
    if (!sr)
        throw Error("yikes")
    for (let child of sr.children) {
        if (child.tagName === "INPUT")
            return child as HTMLInputElement
    }
    throw Error("yikes")
}

function getHTMLButtonElement(): HTMLButtonElement {
    let sr = document.body.children[0].shadowRoot
    if (!sr)
        throw Error("yikes")
    for (let child of sr.children) {
        if (child.tagName === "BUTTON")
            return child as HTMLButtonElement
    }
    throw Error("yikes")
}
