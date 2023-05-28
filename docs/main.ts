/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { loadComponents } from "@toad/util/loadComponents"

import { TextModel } from "@toad/model/TextModel"
import { HtmlModel } from "@toad/model/HtmlModel"
import { BooleanModel } from "@toad/model/BooleanModel"
import { NumberModel } from "@toad/model/NumberModel"
import { EnumModel } from "@toad/model/EnumModel"

import { TablePos } from "@toad/table/TablePos"
import { TableAdapter } from "@toad/table/adapter/TableAdapter"
import { TreeNode } from "@toad/table/model/TreeNode"
import { TreeNodeModel } from "@toad/table/model/TreeNodeModel"
import { TreeAdapter } from "@toad/table/adapter/TreeAdapter"

import { bindModel as bind, action, bindModel } from "@toad/controller/globalController"
import { Template } from "@toad/controller/Template"

import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'
import { SpreadsheetAdapter } from '@toad/table/adapter/SpreadsheetAdapter'

import { initializeSodaMachine } from "./src/sodamachine"
import { initializeStarSystem } from "./src/starsystem"
import { EmailModel } from "@toad/model/EmailModel"
import { css, div, HTMLElementProps, Slider, span, input, View } from "@toad"

loadComponents()

window.onload = () => {
    main()
}

export function main(): void {
    initializeSodaMachine()
    // initializeBooks()
    initializeStarSystem()
    initializeTree()
}

class Slider2 extends View {
    vertical: boolean

    constructor(init?: HTMLElementProps) {
        super(init)

        this.vertical = this.getAttribute("orientation") === "vertical"

        let container, rail: HTMLSpanElement, track: HTMLSpanElement, thumb: HTMLSpanElement, slider: HTMLInputElement
        container = [
            rail = span(),
            track = span(),
            thumb = span(
                slider = input()
            )
        ]
        rail.classList.add('tx-rail')
        track.classList.add('tx-track')
        thumb.classList.add('tx-thumb')
        slider.type = "range"
        slider.min = "0"
        slider.max = "255"
        slider.value = "128"

        const placeSlider = () => {
            const min = parseFloat(slider.min)
            const max = parseFloat(slider.max)
            const value = parseFloat(slider.value)
            const v = (value - min) / (max - min) * 100
            if (this.vertical) {
                track.style.top = `${100-v}%`
                track.style.height = `${v}%`
                thumb.style.top = `${100-v}%`
            } else {
                track.style.left = `0%`
                track.style.width = `${v}%`
                thumb.style.left = `${v}%`
            }
        }
        placeSlider()

        slider.onfocus = () => {
            thumb.classList.add("tx-focus")
        }
        slider.onblur = () => {
            thumb.classList.remove("tx-focus")
        }
        slider.oninput = () => {
            placeSlider()
        }
        let skew: number | undefined = undefined
        thumb.onpointerdown = (ev: PointerEvent) => {
            thumb.setPointerCapture(ev.pointerId)
            const value = parseFloat(slider.value)
            const b = this.getBoundingClientRect()
            const min = parseFloat(slider.min)
            const max = parseFloat(slider.max)
            if (this.vertical) {
                const v = max - (ev.clientY - b.y) / b.height * (max - min)
                skew = value - v
            } else {
                const v = (ev.clientX - b.x) / b.width * (max - min) + min
                skew = value - v
            }
        }
        thumb.onpointermove = (ev: PointerEvent) => {
            if (skew === undefined) {
                return
            }
            ev.preventDefault()

            const b = this.getBoundingClientRect()
            const min = parseFloat(slider.min)
            const max = parseFloat(slider.max)

            let v
            if (this.vertical) {
                v = max - (ev.clientY - b.y) / b.height * (max - min)
            } else {
                v = (ev.clientX - b.x) / b.width * (max - min) + min + skew
            }
            if (v < min) {
                v = min
            }
            if (v > max) {
                v = max
            }
            slider.value = `${v}`
            placeSlider()
        }
        thumb.onpointerup = (ev: PointerEvent) => {
            if (skew === undefined) {
                return
            }
            thumb.onpointermove!(ev)
            skew = undefined
        }

        const style = new CSSStyleSheet()
        style.replaceSync(css`
        :host {
            position: relative;
            box-sizing: content-box;
            display: inline-block;
        }

        :host(:not([orientation="vertical"])) {
            height: 4px;
            width: 100%;
            padding-top: 8px;
            padding-bottom: 8px;
        }

        :host([orientation="vertical"]) {
            width: 4px;
            height: 100%;
            padding-left: 8px;
            padding-right: 8px;
        }

        .tx-rail {
            background-color: var(--tx-gray-500);
            position: absolute;
            display: block;
            border-radius: 2px;
        }

        :host(:not([orientation="vertical"])) .tx-rail {
            top: 50%;
            width: 100%;
            height: 4px;
            transform: translateY(-50%);
        }

        :host([orientation="vertical"]) .tx-rail {
            left: 50%;
            height: 100%;
            width: 4px;
            transform: translateX(-50%);
        }

        .tx-track {
            background-color: var(--tx-gray-700);
            position: absolute;
            display: block;
            border-radius: 2px;
        }

        :host(:not([orientation="vertical"])) .tx-track {  
            top: 50%;
            height: 4px;
            transform: translateY(-50%);
        }

        :host([orientation="vertical"]) .tx-track {  
            left: 50%;
            width: 4px;
            transform: translateX(-50%);
        }

        .tx-thumb {
            border: 2px solid var(--tx-gray-700); /* knob border */
            border-radius: 50%;
            background: var(--tx-gray-75); /* inside knob */
            cursor: pointer;
            position: absolute;
            display: flex;
            width: 14px;
            height: 14px;
            box-sizing: border-box;
            outline-width: 0px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }

        :host(:not([orientation="vertical"])) .tx-thumb { 
            top: 50%;
        }
        :host([orientation="vertical"]) .tx-thumb { 
            left: 50%;
        }

        .tx-focus {
            outline: 2px solid;
            outline-color: var(--tx-outline-color);
            outline-offset: 1px;
        }

        .tx-thumb>input {
            border: 0;
            clip: rect(0, 0, 0, 0);
            width: 100%;
            height: 100%;
            margin: -1px;
            /* this hides most of the slider and centers the thumb */
            overflow: hidden;
            position: absolute;
            white-space: nowrap;
            direction: ltr;
        }
        `)

        this.attachShadow({ mode: 'open', delegatesFocus: true })
        this.shadowRoot!.adoptedStyleSheets = [style]
        this.shadowRoot!.replaceChildren(...container)
    }
}
Slider2.define("tx-slider2", Slider2)

class ColorSelector extends View {
    constructor(init?: HTMLElementProps) {
        super(init)
        this.attachShadow({ mode: 'open' })
        const canvas = document.createElement("canvas")
        canvas.id = "canvas"
        canvas.width = 256 + 32
        canvas.height = 256

        const ctx = canvas.getContext("2d")!
        const myImageData = ctx.createImageData(256 + 32, 256)

        for (let iy = 0, y = -1.0; iy < 256; ++iy, y += 2.0 / 255.0) {
            for (let ix = 0, x = -1.0; ix < 256; ++ix, x += 2.0 / 255.0) {
                let s = Math.hypot(x, y)
                if (s <= 1.0) {
                    const { r, g, b } = hsv2rgb(
                        (Math.atan2(y, x) + Math.PI) / (2.0 * Math.PI) * 360.0,
                        s,
                        1.0)
                    const ptr = (ix + iy * myImageData.width) * 4
                    myImageData.data[ptr] = Math.round(r * 255)
                    myImageData.data[ptr + 1] = Math.round(g * 255)
                    myImageData.data[ptr + 2] = Math.round(b * 255)
                    myImageData.data[ptr + 3] = 255
                }
            }
            for (let ix = 256 + 16; ix < 256 + 32; ++ix) {
                const v = 255 - iy
                const ptr = (ix + iy * myImageData.width) * 4
                myImageData.data[ptr] = Math.round(v)
                myImageData.data[ptr + 1] = Math.round(v)
                myImageData.data[ptr + 2] = Math.round(v)
                myImageData.data[ptr + 3] = 255
            }
        }

        ctx.putImageData(myImageData, 0, 0)

        const r = new NumberModel(0, { min: 0, max: 255 })
        const g = new NumberModel(0, { min: 0, max: 255 })
        const b = new NumberModel(0, { min: 0, max: 255 })

        // i don't seem to have a vertical slider
        // and a gradient as a background would also be nice
        const sliderR = new Slider({ id: "sr", model: r })
        const sliderG = new Slider({ id: "sg", model: g })
        const sliderB = new Slider({ id: "sb", model: b })

        const root = div()
        root.id = "root"

        const style = new CSSStyleSheet()
        style.replaceSync(css`
        #root {
            position: relative;
            width: 256px;
            height: 256px;
        }
        #canvas {
            position: absolute;
            top: 0px;
            left: 0px;
        }
        #sr {
            position: absolute;
            top: 5px;
            left: 292px;
            height: 256px;
        }
        #sg {
            position: absolute;
            top: 5px;
            left: 312px;
            height: 256px;
        }
        #sb {
            position: absolute;
            top: 5px;
            left: 332px;
            height: 256px;
        }
        
        `)
        this.shadowRoot!.adoptedStyleSheets = [style]
        root.appendChild(canvas)
        root.appendChild(sliderR)
        root.appendChild(sliderG)
        root.appendChild(sliderB)
        this.shadowRoot!.appendChild(root)
    }

}
ColorSelector.define("tx-color", ColorSelector)

// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function hsv2rgb(h: number, s: number, v: number): { r: number, g: number, b: number } {
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    return { r: f(5), g: f(3), b: f(1) }
}

const nameModel = new TextModel("", {
    label: "The Name of Your Avatar",
    description: `An avatar is a computer-enhanced doppelganger; a
computer-generated image that takes your place in a three-dimensional online
encounter.`
})

const mailModel = new EmailModel("", {
    label: "Email address",
    description: `Contains a locally interpreted string followed by the
at-sign character ("@", ASCII value 64) followed by an Internet domain. The
locally interpreted string is either a quoted-string or a dot-atom.  If the
string can be represented as a dot-atom (that is, it contains no characters
other than atext characters or "." surrounded by atext characters), then the
dot-atom form SHOULD be used and the quoted-string form SHOULD NOT be used.
Comments and folding white space SHOULD NOT be used around the "@" in the addr-spec.`
})

const birthModel = new NumberModel(1970, {
    min: 1900, max: 2025,
    label: "Year of Birth",
    description: `Unlikely and invalid entries should result in an error message.`
})
bindModel("nameModel", nameModel)
bindModel("mailModel", mailModel)
bindModel("birthModel", birthModel)

//
// <tx-text>
//

let textModel = new TextModel("")
bind("hello", textModel)

//
// <tx-texttool> & <tx-textarea>
//
let markupModel = new HtmlModel("")
markupModel.modified.add(() => {
    document.getElementById("rawhtml")!.innerText = markupModel.value
})
bind("markup", markupModel)

//
// <tx-button>
//
action("hitMe", () => {
    textModel.value = "Hit me too!"
    hitMeMore.enabled = true
})
var hitMeMore = action("hitMeMore", () => {
    textModel.value = "You hit me!"
    hitMeMore.enabled = false
})
action("dummy", () => { })

//
// <tx-checkbox>, <tx-switch> and <tx-if>
//

const off = new BooleanModel(false)
const on = new BooleanModel(true)
const offDisabled = new BooleanModel(false)
offDisabled.enabled = false
const onDisabled = new BooleanModel(true)
onDisabled.enabled = false

bind("off", off)
bind("on", on)
bind("offDisabled", offDisabled)
bind("onDisabled", onDisabled)

//
// EnumModel
//

enum Color {
    BLUEBERRY = 0,
    GRAPE,
    TANGERINE,
    LIME,
    STRAWBERRY,
    BONDIBLUE
}

const flavourEnabled = new EnumModel<Color>(Color)
flavourEnabled.value = Color.GRAPE
bind("flavourEnabled", flavourEnabled)

const flavourDisabled = new EnumModel<Color>(Color)
flavourDisabled.enabled = false
flavourDisabled.value = Color.TANGERINE
bind("flavourDisabled", flavourDisabled)

const customFlavour = new TextModel("")
bind("customFlavour", customFlavour)
const customFlavourDisabled = new TextModel("")
bind("customFlavourDisabled", customFlavourDisabled)
//
// <tx-slider>
//

let size = new NumberModel(42, { min: 0, max: 99 })
bind("size", size)

// <toad-menu>
action("file|logout", () => {
    alert("You are about to logout")
})
action("help", () => {
    alert("Please.")
})

//
// Spreadsheet
//

const sheet = [
    ["Name", "Pieces", "Price/Piece", "Price"],
    ["Apple", "=4", "=0.98", "=B2*C2"],
    ["Banana", "=2", "=1.98", "=B3*C3"],
    ["Citrus", "=1", "=1.48", "=B4*C4"],
    ["SUM", "", "", "=D2+D3+D4"],
]

const spreadsheet = new SpreadsheetModel(25, 25)
for (let row = 0; row < spreadsheet.rowCount; ++row) {
    for (let col = 0; col < spreadsheet.colCount; ++col) {
        if (row < sheet.length && col < sheet[row].length) {
            spreadsheet.setField(col, row, sheet[row][col])
        }
    }
}
TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
bind("spreadsheet", spreadsheet)

//
// Tree
//

class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

// class MyTreeAdapter extends TreeAdapter<MyNode> {
//     override showCell(pos: TablePos, cell: HTMLSpanElement) {
//         // return this.model && this.treeCell(row, this.model.rows[row].node.label)
//     }
// }

class MyTreeAdapter extends TreeAdapter<MyNode> {
    constructor(model: TreeNodeModel<MyNode>) {
        super(model)
        this.config.seamless = true
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        const rowinfo = this.model.rows[pos.row]
        const label = rowinfo.node.label
        super.treeCell(pos, cell, label)
    }
}

function initializeTree(): void {
    TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)
    let model = new TreeNodeModel(MyNode)
    model.addSiblingAfter(0)
    model.addChildAfter(0)
    model.addChildAfter(1)
    model.addSiblingAfter(2)
    model.addSiblingAfter(1)
    model.addChildAfter(4)
    model.addSiblingAfter(0)
    bind("tree", model)
}

class MyCodeButton extends HTMLElement {
    condition = new BooleanModel(false)
    constructor() {
        super()
        let template = new Template("my-code-button") // FIXME: how about inlining the HTML?
        let label = template.text("label", "Show Code")
        template.action("action", () => {
            if (this.condition.value) {
                this.condition.value = false
                label.value = "Show Code"
            } else {
                this.condition.value = true
                label.value = "Hide Code"
            }
        })
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(template.root)
    }
    connectedCallback() {
        bind(this.getAttribute("condition")!, this.condition) // FIXME: bind to parents context
    }
}
window.customElements.define("my-code-button", MyCodeButton)

